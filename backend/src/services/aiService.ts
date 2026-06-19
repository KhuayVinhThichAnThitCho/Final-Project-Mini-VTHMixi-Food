import { Groq } from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Restaurant } from '../models/Restaurant';
import { AppError } from '../middlewares/errorHandler';
import { Op } from 'sequelize';

const aiProvider = process.env.AI_PROVIDER || 'gemini';

let groq: Groq | null = null;
let ai: GoogleGenAI | null = null;

if (aiProvider === 'groq' && process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export const aiService = {
  analyzeVendorData: async (vendorId: string, question: string) => {
    // 1. Gather Context Data for Vendor
    const restaurant = await Restaurant.findOne({ where: { ownerId: vendorId } });
    if (!restaurant) {
      throw new AppError(404, 'NOT_FOUND', 'Cửa hàng không tồn tại.');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Revenue
    const recentOrders = await Order.findAll({
      where: {
        restaurantId: restaurant.id,
        status: 'completed',
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      attributes: ['id', 'totalAmount', 'createdAt']
    });

    let totalRevenue = 0;
    const orderIds: string[] = [];
    recentOrders.forEach(o => {
      totalRevenue += Number(o.totalAmount);
      orderIds.push(o.id);
    });

    // Reviews
    let recentReviews: any[] = [];
    if (orderIds.length > 0) {
      recentReviews = await Review.findAll({
        where: {
          orderId: { [Op.in]: orderIds },
          createdAt: { [Op.gte]: thirtyDaysAgo }
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
        attributes: ['rating', 'comment', 'createdAt']
      });
    }

    // Format Context
    const contextData = {
      vendorId,
      timeframe: 'Last 30 days',
      totalOrders: recentOrders.length,
      totalRevenue,
      recentReviews: recentReviews.map(r => ({ rating: r.rating, comment: r.comment }))
    };

    const prompt = `
Bạn là "Vendor Analytics & Strategy Co-pilot", một chuyên gia phân tích dữ liệu cho các cửa hàng trên nền tảng GrabFood Mini.
Người dùng (Chủ quán) đang hỏi bạn: "${question}"

Dưới đây là dữ liệu kinh doanh của họ trong 30 ngày qua:
${JSON.stringify(contextData, null, 2)}

Dựa vào dữ liệu này, hãy phân tích và trả lời câu hỏi của chủ quán. Đưa ra nguyên nhân có thể và đề xuất chiến lược hành động.
Hãy định dạng câu trả lời dưới dạng JSON hợp lệ theo cấu trúc sau (không bao gồm markdown code block, chỉ xuất JSON thuần tuý):
{
  "insight": "Đoạn phân tích ngắn gọn, thân thiện giải thích tình hình.",
  "actionable_advice": ["Lời khuyên 1", "Lời khuyên 2", "Lời khuyên 3"],
  "chart_data": [
    {"name": "Doanh thu", "value": 100000},
    {"name": "Đơn hàng", "value": 50}
  ]
}
Lưu ý: chart_data là dữ liệu giả định bạn trích xuất hoặc suy luận để vẽ biểu đồ minh họa. Cố gắng tạo dữ liệu biểu đồ liên quan đến câu hỏi.
`;

    if (aiProvider === 'groq' && groq) {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        response_format: { type: 'json_object' }
      });
      return JSON.parse(completion.choices[0]?.message?.content || '{}');
    } else if (aiProvider === 'gemini' && ai) {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      return JSON.parse(response.text || '{}');
    } else {
      throw new AppError(500, 'INTERNAL_ERROR', 'AI Provider is not configured properly.');
    }
  }
};
