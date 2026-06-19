import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './orderController';
import { aiService } from '../services/aiService';
import { AppError } from '../middlewares/errorHandler';

export const aiController = {
  askCopilot: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.role !== 'vendor') {
        throw new AppError(403, 'FORBIDDEN', 'Chỉ chủ quán mới được truy cập tính năng này.');
      }
      
      const { question } = req.body;
      if (!question) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Vui lòng đặt câu hỏi.');
      }

      // Vị trí của vendor chính là ID của họ vì 1 user(role=vendor) = 1 restaurant
      // Tạm thời lấy trực tiếp id của user
      const vendorId = req.user.id;

      const data = await aiService.analyzeVendorData(vendorId, question);
      
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};
