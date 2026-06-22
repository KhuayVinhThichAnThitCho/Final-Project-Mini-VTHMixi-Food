import { Groq } from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import { AppError } from '../middlewares/errorHandler';
import { aiCustomerTools } from './aiCustomerTools';
import { CustomerAiConversation } from '../models/CustomerAiConversation';
import { CustomerAiMessage } from '../models/CustomerAiMessage';

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
    const conversation = await CustomerAiConversation.findOne({ 
      where: { userId },
      include: [{
        model: CustomerAiMessage,
        as: 'messages',
        attributes: ['id', 'role', 'content', 'createdAt']
      }],
      order: [[{ model: CustomerAiMessage, as: 'messages' }, 'createdAt', 'ASC']]
    });

    if (!conversation) return [];

    return conversation.messages.map(msg => {
      let parsedContent = msg.content;
      if (msg.role === 'assistant' && msg.content) {
        try {
          parsedContent = JSON.parse(msg.content);
        } catch (e) {}
      }
      return {
        id: msg.id,
        role: msg.role,
        content: parsedContent,
        createdAt: msg.createdAt
      };
    });
  },

  askAssistant: async (userId: string, question: string) => {
    let conversation = await CustomerAiConversation.findOne({ where: { userId } });
    if (!conversation) {
      conversation = await CustomerAiConversation.create({ userId });
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
1. "searchMenuItems": Tìm món ăn theo tên/mô tả. QUAN TRỌNG: Nếu khách hỏi chung chung như "bữa trưa", "đồ ăn", "ăn kiêng", hãy để query="". Chỉ nhập từ khóa CỤ THỂ (VD: "Gà", "Không hải sản", "Cơm"). Tham số: { "query": string, "maxPrice": number (tùy chọn, giá bằng VND nguyên vẹn, ví dụ: 300k -> 300000) }
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
Nếu không cần gọi, trả về: { "tools": [] }
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
            contextData.searchResults = await aiCustomerTools.searchMenuItems(toolCall.args.query, toolCall.args.maxPrice);
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
1. Nếu khách hàng yêu cầu "Lên thực đơn" hoặc "Kế hoạch" với một số người/ngân sách cụ thể, KHÔNG ĐƯỢC chỉ liệt kê ngẫu nhiên. BẮT BUỘC phải tính toán, phối hợp các món (VD: món mặn, món canh, nước uống) sao cho TỔNG SỐ TIỀN (Giá món x Số lượng phần ăn) đáp ứng đúng ngân sách.
2. Trong phần "message", hãy giải thích chi tiết thực đơn này gồm những gì, tổng thiệt hại bao nhiêu, tại sao lại cân bằng dinh dưỡng.
3. Nếu bạn đã thêm vào giỏ hàng, hãy thông báo cho họ.
4. Mọi thông tin phải dựa trên DỮ LIỆU TỪ CÔNG CỤ (không tự bịa món ăn).

Hãy định dạng câu trả lời dưới dạng JSON (không markdown):
{
  "message": "Phân tích kế hoạch ăn uống rõ ràng, tính toán ngân sách chi tiết...",
  "recommended_items": [
    { "name": "Tên món", "price": 100000, "reason": "Lý do khuyên dùng & Đề xuất số lượng (VD: Gợi ý 4 phần cho 4 người, tiết kiệm...)" }
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

    await CustomerAiMessage.create({
      customerAiConversationId: conversation.id,
      role: 'assistant',
      content: JSON.stringify(finalAnswer)
    });

    return finalAnswer;
  }
};
