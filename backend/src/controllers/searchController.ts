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

      const keywords = q.split(/\s+/).filter(kw => kw.trim().length > 0);
      let menuItems: any[] = [];
      let restaurants: any[] = [];

      if (type === 'all' || type === 'menu') {
        const keywordConditions = keywords.map(kw => ({
          [Op.or]: [
            { name: { [Op.like]: `%${kw}%` } },
            { description: { [Op.like]: `%${kw}%` } }
          ]
        }));

        const menuWhereClause: any = {
          isDeleted: false,
          isAvailable: true,
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ]
        };

        if (keywordConditions.length > 0) {
          menuWhereClause[Op.or].push({ [Op.and]: keywordConditions });
        }

        menuItems = await MenuItem.findAll({
          where: menuWhereClause,
          limit: limit * 2, // Fetch double the limit to allow re-ranking in memory
        });

        // Smart re-ranking in memory
        menuItems.sort((a: any, b: any) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const qLower = q.toLowerCase();

          // Rule 1: Exact matches or exact starts-with
          const aExact = aName === qLower;
          const bExact = bName === qLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          const aStarts = aName.startsWith(qLower);
          const bStarts = bName.startsWith(qLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;

          const aContains = aName.includes(qLower);
          const bContains = bName.includes(qLower);
          if (aContains && !bContains) return -1;
          if (!aContains && bContains) return 1;

          // Rule 2: Count matched keywords
          let aMatchCount = 0;
          let bMatchCount = 0;
          keywords.forEach(kw => {
            const kwL = kw.toLowerCase();
            if (aName.includes(kwL)) aMatchCount++;
            if (bName.includes(kwL)) bMatchCount++;
          });

          if (aMatchCount !== bMatchCount) {
            return bMatchCount - aMatchCount; // Descending
          }

          // Rule 3: soldCount
          return b.soldCount - a.soldCount;
        });

        // Trim to desired limit
        menuItems = menuItems.slice(0, limit);
      }

      if (type === 'all' || type === 'restaurant') {
        const keywordConditions = keywords.map(kw => ({
          [Op.or]: [
            { name: { [Op.like]: `%${kw}%` } },
            { address: { [Op.like]: `%${kw}%` } }
          ]
        }));

        const restaurantWhereClause: any = {
          status: { [Op.ne]: 'banned' },
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { address: { [Op.like]: `%${q}%` } }
          ]
        };

        if (keywordConditions.length > 0) {
          restaurantWhereClause[Op.or].push({ [Op.and]: keywordConditions });
        }

        restaurants = await Restaurant.findAll({
          where: restaurantWhereClause,
          limit: limit * 2,
        });

        restaurants.sort((a: any, b: any) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const qLower = q.toLowerCase();

          const aExact = aName === qLower;
          const bExact = bName === qLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          const aStarts = aName.startsWith(qLower);
          const bStarts = bName.startsWith(qLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;

          const aContains = aName.includes(qLower);
          const bContains = bName.includes(qLower);
          if (aContains && !bContains) return -1;
          if (!aContains && bContains) return 1;

          let aMatchCount = 0;
          let bMatchCount = 0;
          keywords.forEach(kw => {
            const kwL = kw.toLowerCase();
            if (aName.includes(kwL)) aMatchCount++;
            if (bName.includes(kwL)) bMatchCount++;
          });

          if (aMatchCount !== bMatchCount) {
            return bMatchCount - aMatchCount;
          }

          return b.ratingAvg - a.ratingAvg;
        });

        restaurants = restaurants.slice(0, limit);
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
