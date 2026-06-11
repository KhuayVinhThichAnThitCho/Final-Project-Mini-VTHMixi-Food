import { Request, Response, NextFunction } from 'express';
import { MenuItem } from '../models/MenuItem';
import { Restaurant } from '../models/Restaurant';
import { Op } from 'sequelize';

export const searchController = {
  /**
   * GET /api/v1/search?q=...&type=all|menu|restaurant
   * Tìm kiếm tổng hợp: món ăn + nhà hàng
   */
  search: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = (req.query.q as string || '').trim();
      const type = (req.query.type as string) || 'all';
      const limit = parseInt(req.query.limit as string) || 10;

      if (!q || q.length < 1) {
        res.status(200).json({ success: true, data: { menuItems: [], restaurants: [] } });
        return;
      }

      const likeQuery = { [Op.like]: `%${q}%` };
      let menuItems: any[] = [];
      let restaurants: any[] = [];

      if (type === 'all' || type === 'menu') {
        menuItems = await MenuItem.findAll({
          where: {
            isDeleted: false,
            isAvailable: true,
            [Op.or]: [
              { name: likeQuery },
              { description: likeQuery },
            ],
          },
          limit,
          order: [['soldCount', 'DESC']],
        });
      }

      if (type === 'all' || type === 'restaurant') {
        restaurants = await Restaurant.findAll({
          where: {
            status: { [Op.ne]: 'banned' },
            [Op.or]: [
              { name: likeQuery },
              { address: likeQuery },
            ],
          },
          limit,
          order: [['ratingAvg', 'DESC']],
        });
      }

      res.status(200).json({
        success: true,
        data: { menuItems, restaurants },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/search/suggestions?q=...
   * Gợi ý autocomplete (tên món + tên nhà hàng)
   */
  getSuggestions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = (req.query.q as string || '').trim();

      if (!q || q.length < 1) {
        res.status(200).json({ success: true, data: [] });
        return;
      }

      const likeQuery = { [Op.like]: `%${q}%` };

      const [menuItems, restaurants] = await Promise.all([
        MenuItem.findAll({
          where: { isDeleted: false, isAvailable: true, name: likeQuery },
          limit: 5,
          attributes: ['id', 'name', 'category'],
          order: [['soldCount', 'DESC']],
        }),
        Restaurant.findAll({
          where: { status: { [Op.ne]: 'banned' }, name: likeQuery },
          limit: 3,
          attributes: ['id', 'name', 'address'],
          order: [['ratingAvg', 'DESC']],
        }),
      ]);

      const suggestions = [
        ...menuItems.map((m: any) => ({ id: m.id, label: m.name, type: 'menu', category: m.category })),
        ...restaurants.map((r: any) => ({ id: r.id, label: r.name, type: 'restaurant', address: r.address })),
      ];

      res.status(200).json({ success: true, data: suggestions });
    } catch (error) {
      next(error);
    }
  },
};

export default searchController;
