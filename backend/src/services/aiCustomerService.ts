import { Groq } from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import { AppError } from '../middlewares/errorHandler';
import { aiCustomerTools } from './aiCustomerTools';
import { CustomerAiConversation } from '../models/CustomerAiConversation';
import { CustomerAiMessage } from '../models/CustomerAiMessage';
import { MenuItem } from '../models/MenuItem';
import { Op } from 'sequelize';
import { redisClient } from '../config/redis';

const aiProvider = process.env.AI_PROVIDER || 'gemini';

let groq: Groq | null = null;
let ai: GoogleGenAI | null = null;

if (aiProvider === 'groq' && process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const callLLM = async (prompt: string, expectJson: boolean = true) => {
  if (aiProvider === 'groq' && groq) {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      response_format: expectJson ? { type: 'json_object' } : undefined,
    });
    return completion.choices[0]?.message?.content || '{}';
  } else if (aiProvider === 'gemini' && ai) {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      contents: prompt,
      config: expectJson ? { responseMimeType: "application/json" } : undefined
    });
    return response.text || '{}';
  } else {
    throw new AppError(500, 'INTERNAL_ERROR', 'AI Provider is not configured properly.');
  }
};

const parseJsonGracefully = (text: string): any => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned.trim());
};

export const aiCustomerService = {
  getChatHistory: async (userId: string) => {
    const redisKey = `chat:user:${userId}`;

    // Kiểm tra cache Redis
    try {
      if (redisClient.isOpen) {
        const cached = await redisClient.get(redisKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }
    } catch (err) {
      console.error('Redis getChatHistory error:', err);
    }

    let conversation = await CustomerAiConversation.findOne({ where: { userId } });
    if (!conversation) {
      conversation = await CustomerAiConversation.create({ userId });
    }

    // Xóa các tin nhắn cũ hơn 24 giờ
    const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
      await CustomerAiMessage.destroy({
        where: {
          customerAiConversationId: conversation.id,
          createdAt: {
            [Op.lt]: timeLimit
          }
        }
      });
    } catch (err) {
      console.error('Error clearing old customer AI messages:', err);
    }

    const messages = await CustomerAiMessage.findAll({
      where: { customerAiConversationId: conversation.id },
      order: [['createdAt', 'ASC']]
    });

    const history = messages.map(msg => {
      let parsedContent = msg.content;
      if (msg.role === 'assistant' && msg.content) {
        try {
          parsedContent = JSON.parse(msg.content);
        } catch (e) { }
      }
      return {
        id: msg.id,
        role: msg.role,
        content: parsedContent,
        createdAt: msg.createdAt
      };
    });

    // Lưu vào cache Redis (TTL 24 giờ = 86400 giây)
    try {
      if (redisClient.isOpen) {
        await redisClient.setEx(redisKey, 86400, JSON.stringify(history));
      }
    } catch (err) {
      console.error('Redis setChatHistory error:', err);
    }

    return history;
  },

  askAssistant: async (userId: string, question: string) => {
    // Xóa cache cũ để tránh bất đồng bộ
    try {
      if (redisClient.isOpen) {
        await redisClient.del(`chat:user:${userId}`);
      }
    } catch (err) {
      console.error('Redis clear cache error:', err);
    }

    let conversation = await CustomerAiConversation.findOne({ where: { userId } });
    if (!conversation) {
      conversation = await CustomerAiConversation.create({ userId });
    }

    // Xóa các tin nhắn cũ hơn 24 giờ trước khi thêm tin nhắn mới
    const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
      await CustomerAiMessage.destroy({
        where: {
          customerAiConversationId: conversation.id,
          createdAt: {
            [Op.lt]: timeLimit
          }
        }
      });
    } catch (err) {
      console.error('Error clearing old customer AI messages:', err);
    }

    await CustomerAiMessage.create({
      customerAiConversationId: conversation.id,
      role: 'user',
      content: question
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    // 1. Tool Selection Prompt
    const toolPrompt = `
Bạn là "Smart Cart & Nutritional Planner", trợ lý mua sắm đồ ăn cho khách hàng.
Khách hàng vừa hỏi: "${question}"
Customizations/Rules:
- Tất cả các giá tiền trong hệ thống là tiền tệ Việt Nam Đồng (VND).
- Nếu người dùng đưa ra ngân sách hoặc giới hạn tiền dưới dạng "300k", "50k", hãy tự động nhân với 1000 (ví dụ: 300k là 300000, 50k là 50000) để tìm chính xác giá lưu trữ trong DB.

Bạn có 2 công cụ:
1. "searchMenuItems": Tìm món ăn theo tên/mô tả. QUAN TRỌNG: Nếu khách hỏi chung chung như "bữa trưa", "đồ ăn", "ăn kiêng", hãy để query="". Chỉ nhập từ khóa CỤ THỂ (VD: "Gà", "Cơm"). Tham số: { "query": string, "maxPrice": number (tùy chọn, giá bằng VND nguyên vẹn, ví dụ: 300k -> 300000), "servings": number (số người ăn / số phần ăn, tùy chọn) }
2. "addItemsToCart": Thêm món vào giỏ. CHỈ GỌI KHI ĐÃ TÌM ĐƯỢC MÓN VÀ KHÁCH ĐỒNG Ý THÊM. Tham số: { "items": [{ "menuItemId": string, "quantity": number, "restaurantId": string }] }

Quyết định gọi CÁC CÔNG CỤ NÀO:
Trả về JSON duy nhất:
{
  "tools": [
    {
      "name": "tên_công_cụ",
      "args": { "tên_tham_số": giá_trị }
    }
  ]
}
If there is no tool to call, return: { "tools": [] }
`;

    let toolDecision;
    try {
      const toolResponseText = await callLLM(toolPrompt, true);
      toolDecision = parseJsonGracefully(toolResponseText);
    } catch (e) {
      console.error('Error in AI customer tool decision:', e);
      toolDecision = { tools: [] };
    }

    let contextData: Record<string, any> = {};
    if (toolDecision && Array.isArray(toolDecision.tools)) {
      await Promise.all(toolDecision.tools.map(async (toolCall: any) => {
        try {
          if (toolCall.name === 'searchMenuItems') {
            contextData.searchResults = await aiCustomerTools.searchMenuItems(
              toolCall.args.query,
              toolCall.args.maxPrice,
              toolCall.args.servings
            );
          } else if (toolCall.name === 'addItemsToCart') {
            contextData.cartStatus = await aiCustomerTools.addItemsToCart(userId, toolCall.args.items);
          }
        } catch (err) {
          contextData[toolCall.name] = { error: "Lỗi thực thi tool." };
        }
      }));
    }

    const recentMessages = await CustomerAiMessage.findAll({
      where: { customerAiConversationId: conversation.id },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    const historyText = recentMessages.reverse().map(m => `${m.role}: ${m.content}`).join('\n');

    // 2. Final Synthesis Prompt
    const finalPrompt = `
Bạn là "Smart Cart & Nutritional Planner", trợ lý mua sắm đồ ăn tận tâm.
Lịch sử chat:
${historyText}

Câu hỏi khách hàng: "${question}"

Kết quả từ công cụ (Database/Cart):
${JSON.stringify(contextData, null, 2)}

NHIỆM VỤ CỦA BẠN:
1. Nếu kết quả công cụ searchMenuItems trả về danh sách "suggested_combos", hãy giới thiệu các phương án Combo này cho khách hàng (ví dụ: Combo Tiết kiệm, Combo Đầy đủ...). Các Combo này đã được tính toán chính xác 100% khớp ngân sách. Hãy trình bày chi tiết các món ăn, số lượng và tổng giá tiền của từng Combo lựa chọn trong tin nhắn "message".
2. Trong phần "recommended_items", hãy lấy chính xác danh sách các món ăn thuộc Combo mà bạn muốn gợi ý hoặc Combo khách hàng đã lựa chọn từ trường "items" của Combo đó trong "suggested_combos". 
   Mỗi món ăn trong recommended_items phải giữ nguyên cấu trúc: { "id": "menuItemId", "restaurantId": "restaurantId", "name": "Tên món", "price": số_tiền, "reason": "Gợi ý số lượng phần ăn..." }.
3. Nếu khách hàng yêu cầu "Lên thực đơn" hoặc "Kế hoạch" nhưng không có "suggested_combos", hãy phối hợp các món từ danh sách "items" sao cho TỔNG SỐ TIỀN đáp ứng đúng ngân sách.
4. Mọi thông tin phải dựa trên DỮ LIỆU TỪ CÔNG CỤ (không tự bịa món ăn).
5. TUYỆT ĐỐI KHÔNG tự sáng chế, bịa ra món ăn, ID hoặc restaurantId không có trong kết quả trả về từ công cụ searchMenuItems. Nếu kết quả tìm kiếm trống hoặc không tìm được món ăn nào phù hợp với yêu cầu của khách hàng trong DB, hãy lịch sự thông báo cho họ trong phần "message" và để "recommended_items" là mảng rỗng [].

Hãy định dạng câu trả lời dưới dạng JSON (không markdown):
{
  "message": "Phân tích kế hoạch ăn uống rõ ràng, trình bày các Combo đề xuất chi tiết...",
  "recommended_items": [
    { "id": "menuItemId", "restaurantId": "restaurantId", "name": "Tên món", "price": 100000, "reason": "Lý do khuyên dùng & Gợi ý số lượng (VD: Gợi ý 4 phần...)" }
  ]
}
`;

    let finalAnswer;
    try {
      const finalResponseText = await callLLM(finalPrompt, true);
      finalAnswer = parseJsonGracefully(finalResponseText);
    } catch (e: any) {
      console.error('Error in AI customer final synthesis:', e);
      throw new AppError(500, 'INTERNAL_ERROR', `Lỗi khi AI sinh câu trả lời: ${e.message || e}`);
    }

    // Xác thực và làm sạch các món đề xuất từ AI đối chiếu với Database thực tế
    if (finalAnswer && Array.isArray(finalAnswer.recommended_items)) {
      const validatedItems: any[] = [];
      for (const recItem of finalAnswer.recommended_items) {
        if (!recItem || typeof recItem !== 'object') continue;
        
        let dbItem = null;
        
        // 1. Tìm bằng ID trước
        if (recItem.id) {
          dbItem = await MenuItem.findOne({
            where: { id: recItem.id, isDeleted: false, isAvailable: true }
          });
        }
        
        // 2. Nếu ID không khớp, thử tìm kiếm gần đúng theo tên
        if (!dbItem && recItem.name) {
          dbItem = await MenuItem.findOne({
            where: {
              name: { [Op.like]: `%${recItem.name.trim()}%` },
              isDeleted: false,
              isAvailable: true
            }
          });
        }
        
        // 3. Nếu tìm thấy món thực trong DB, chuẩn hóa lại thông tin. Nếu không thấy, bỏ qua món bịa này.
        if (dbItem) {
          validatedItems.push({
            id: dbItem.id,
            restaurantId: dbItem.restaurantId,
            name: dbItem.name,
            price: Number(dbItem.price),
            reason: recItem.reason || ''
          });
        } else {
          console.warn(`[AI Customer Service] Lọc bỏ món đề xuất ảo: ${JSON.stringify(recItem)}`);
        }
      }
      finalAnswer.recommended_items = validatedItems;
    }

    await CustomerAiMessage.create({
      customerAiConversationId: conversation.id,
      role: 'assistant',
      content: JSON.stringify(finalAnswer)
    });

    // Xóa cache cũ để cập nhật lịch sử chat mới
    try {
      if (redisClient.isOpen) {
        await redisClient.del(`chat:user:${userId}`);
      }
    } catch (err) {
      console.error('Redis clear cache error:', err);
    }

    return finalAnswer;
  }
};
