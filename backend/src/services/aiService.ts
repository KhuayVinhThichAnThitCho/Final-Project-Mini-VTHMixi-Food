import { Groq } from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import { Restaurant } from '../models/Restaurant';
import { AppError } from '../middlewares/errorHandler';
import { aiTools } from './aiTools';
import { AiConversation } from '../models/AiConversation';
import { AiMessage } from '../models/AiMessage';
import { redisClient } from '../config/redis';
import { Op } from 'sequelize';

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

export const aiService = {
  getChatHistory: async (vendorId: string) => {
    const redisKey = `chat:vendor:${vendorId}`;

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

    const restaurant = await Restaurant.findOne({ where: { ownerId: vendorId } });
    if (!restaurant) {
      throw new AppError(404, 'NOT_FOUND', 'Cửa hàng không tồn tại.');
    }

    let conversation = await AiConversation.findOne({ where: { restaurantId: restaurant.id } });
    if (!conversation) {
      conversation = await AiConversation.create({ restaurantId: restaurant.id });
    }

    // Xóa các tin nhắn cũ hơn 24 giờ
    const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
      await AiMessage.destroy({
        where: {
          aiConversationId: conversation.id,
          createdAt: {
            [Op.lt]: timeLimit
          }
        }
      });
    } catch (err) {
      console.error('Error clearing old vendor AI messages:', err);
    }

    const messages = await AiMessage.findAll({
      where: { aiConversationId: conversation.id },
      order: [['createdAt', 'ASC']]
    });

    // Parse the JSON content for assistant messages so the frontend doesn't have to
    const history = messages.map(msg => {
      let parsedContent = msg.content;
      if (msg.role === 'assistant' && msg.content) {
        try {
          parsedContent = JSON.parse(msg.content);
        } catch (e) {
          // If it's not JSON, leave it as string
        }
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

  analyzeVendorData: async (vendorId: string, question: string) => {
    // Xóa cache cũ để tránh bất đồng bộ
    try {
      if (redisClient.isOpen) {
        await redisClient.del(`chat:vendor:${vendorId}`);
      }
    } catch (err) {
      console.error('Redis clear cache error:', err);
    }

    const restaurant = await Restaurant.findOne({ where: { ownerId: vendorId } });
    if (!restaurant) {
      throw new AppError(404, 'NOT_FOUND', 'Cửa hàng không tồn tại.');
    }

    // 1. Lấy hoặc tạo Conversation
    let conversation = await AiConversation.findOne({ where: { restaurantId: restaurant.id } });
    if (!conversation) {
      conversation = await AiConversation.create({ restaurantId: restaurant.id });
    }

    // Xóa các tin nhắn cũ hơn 24 giờ trước khi thêm mới
    const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
      await AiMessage.destroy({
        where: {
          aiConversationId: conversation.id,
          createdAt: {
            [Op.lt]: timeLimit
          }
        }
      });
    } catch (err) {
      console.error('Error clearing old vendor AI messages:', err);
    }

    // Lưu tin nhắn của người dùng
    await AiMessage.create({
      aiConversationId: conversation.id,
      role: 'user',
      content: question
    });

    // Cập nhật lastMessageAt
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // 2. Phân tích ngữ cảnh - Xác định xem cần gọi Tool nào (Text-to-API)
    const toolPrompt = `
Bạn là "Vendor Analytics & Strategy Co-pilot", một chuyên gia phân tích dữ liệu nhà hàng.
Câu hỏi của chủ quán: "${question}"

Bạn có 4 công cụ sau để lấy dữ liệu hoặc ghi nhớ:
1. "getRevenueTrends": Lấy tổng doanh thu theo ngày. Tham số: { "days": number (mặc định 7) }
2. "getMenuPerformance": Lấy top món ăn bán chạy và bán chậm. Tham số: { "days": number (mặc định 30) }
3. "getRecentReviews": Lấy đánh giá của khách hàng. Tham số: { "maxRating": number (từ 1 đến 5, mặc định 5), "limit": number (mặc định 10) }
4. "updateBusinessMemory": Ghi nhớ các thông tin/đặc điểm kinh doanh dài hạn (phong cách, mục tiêu khách hàng, sở thích giảm giá...). Tham số: { "memoryObject": { "key": "value" } }

Dựa vào câu hỏi, hãy quyết định xem bạn cần gọi NHỮNG công cụ nào để lấy đủ dữ liệu. Bạn có thể gọi TỪ 0 ĐẾN NHIỀU công cụ cùng lúc.
Trả về JSON duy nhất theo cấu trúc mảng các công cụ cần gọi (không kèm markdown):
{
  "tools": [
    {
      "name": "tên_công_cụ",
      "args": { "tên_tham_số": giá_trị }
    }
  ]
}
Nếu không cần gọi công cụ nào, hãy trả về: { "tools": [] }
`;
    
    let toolDecision;
    try {
      const toolResponseText = await callLLM(toolPrompt, true);
      toolDecision = parseJsonGracefully(toolResponseText);
    } catch (e) {
      toolDecision = { tools: [] };
    }

    // 3. Thực thi song song các Tools (Parallel Execution)
    let contextData: Record<string, any> = {};
    if (toolDecision && Array.isArray(toolDecision.tools)) {
      await Promise.all(toolDecision.tools.map(async (toolCall: any) => {
        try {
          if (toolCall.name === 'getRevenueTrends') {
            contextData.revenueTrends = await aiTools.getRevenueTrends(restaurant.id, toolCall.args?.days);
          } else if (toolCall.name === 'getMenuPerformance') {
            contextData.menuPerformance = await aiTools.getMenuPerformance(restaurant.id, toolCall.args?.days);
          } else if (toolCall.name === 'getRecentReviews') {
            contextData.recentReviews = await aiTools.getRecentReviews(restaurant.id, toolCall.args?.maxRating, toolCall.args?.limit);
          } else if (toolCall.name === 'updateBusinessMemory') {
            contextData.memoryUpdate = await aiTools.updateBusinessMemory(restaurant.id, toolCall.args?.memoryObject);
            // Refresh conversation memory in memory
            conversation.businessMemory = contextData.memoryUpdate.memory;
          }
        } catch (err) {
          console.error(`Lỗi khi chạy AI Tool ${toolCall.name}:`, err);
          contextData[toolCall.name] = { error: "Không thể lấy dữ liệu." };
        }
      }));
    }

    // Lấy lịch sử chat (3 tin nhắn gần nhất)
    const recentMessages = await AiMessage.findAll({
      where: { aiConversationId: conversation.id },
      order: [['createdAt', 'DESC']],
      limit: 3
    });
    const historyText = recentMessages.reverse().map(m => `${m.role}: ${m.content}`).join('\\n');

    // 4. Sinh câu trả lời cuối cùng
    const finalPrompt = `
Bạn là "Vendor Analytics & Strategy Co-pilot".

Trí nhớ dài hạn của bạn về quán ăn này (Business Memory):
${JSON.stringify(conversation.businessMemory || {}, null, 2)}

Lịch sử trò chuyện gần đây:
${historyText}

Câu hỏi hiện tại của chủ quán: "${question}"

Dữ liệu kinh doanh thu thập được từ cơ sở dữ liệu:
${JSON.stringify(contextData, null, 2)}

Dựa vào dữ liệu này và lịch sử trò chuyện, hãy phân tích và trả lời câu hỏi của chủ quán.
Hãy định dạng câu trả lời dưới dạng JSON hợp lệ theo cấu trúc sau (chỉ xuất JSON thuần tuý, không markdown):
{
  "insight": "Đoạn phân tích RẤT CHI TIẾT. Bắt buộc phải sử dụng CÁC CON SỐ CỤ THỂ từ database để giải thích nguyên nhân, diễn biến và kết quả. Tuyệt đối KHÔNG nói chung chung kiểu 'cần phân tích sâu hơn', bạn LÀ người phân tích, hãy phân tích ngay tại đây dựa trên số liệu.",
  "actionable_advice": ["Lời khuyên 1", "Lời khuyên 2", "Lời khuyên 3"],
  "chart_type": "bar | line | pie",
  "chart_title": "Tiêu đề biểu đồ minh họa (ví dụ: Xu hướng doanh thu, Tỷ trọng món ăn)",
  "chart_data": [
    {"name": "Mục 1", "value": 100},
    {"name": "Mục 2", "value": 50}
  ]
}
Lưu ý: Bạn phải đóng vai trò là một Data Analyst chuyên nghiệp. Tránh sử dụng những câu sáo rỗng. Bạn phải tự suy luận và chọn 'chart_type' phù hợp (ví dụ: 'line' cho xu hướng theo thời gian, 'bar' để so sánh số lượng, 'pie' cho tỷ trọng phần trăm). 'chart_data' là dữ liệu bạn trích xuất từ database query để vẽ biểu đồ.
`;

    let finalAnswer;
    try {
      const finalResponseText = await callLLM(finalPrompt, true);
      finalAnswer = parseJsonGracefully(finalResponseText);
    } catch (e: any) {
      console.error('Error in AI manager final synthesis:', e);
      throw new AppError(500, 'INTERNAL_ERROR', `Lỗi khi AI sinh câu trả lời: ${e.message || e}`);
    }

    // Lưu câu trả lời của AI vào lịch sử
    await AiMessage.create({
      aiConversationId: conversation.id,
      role: 'assistant',
      content: JSON.stringify(finalAnswer)
    });

    // Xóa cache cũ để cập nhật lịch sử chat mới
    try {
      if (redisClient.isOpen) {
        await redisClient.del(`chat:vendor:${vendorId}`);
      }
    } catch (err) {
      console.error('Redis clear cache error:', err);
    }

    return finalAnswer;
  }
};
