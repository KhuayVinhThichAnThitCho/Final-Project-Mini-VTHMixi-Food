import { MenuItem } from '../models/MenuItem';
import { Restaurant } from '../models/Restaurant';

export const menuItemRepository = {
  /**
   * Lấy danh sách sản phẩm phân trang theo danh mục
   */
  findPaginated: async (category: string, offset: number, limit: number) => {
    const whereClause: any = { isDeleted: false, isAvailable: true };
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const { rows, count } = await MenuItem.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'deliveryFee', 'status', 'ratingAvg', 'operatingHours'],
        },
      ],
    });

    return { items: rows, total: count };
  },

  /**
   * Lấy Top sản phẩm bán chạy nhất
   */
  findTopBestSellers: async (limit: number): Promise<MenuItem[]> => {
    return await MenuItem.findAll({
      where: { isDeleted: false, isAvailable: true },
      order: [['soldCount', 'DESC']],
      limit,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'deliveryFee', 'status', 'ratingAvg', 'operatingHours'],
        },
      ],
    });
  },

  /**
   * Lấy Top sản phẩm xem nhiều nhất
   */
  findTopMostViewed: async (limit: number): Promise<MenuItem[]> => {
    return await MenuItem.findAll({
      where: { isDeleted: false, isAvailable: true },
      order: [['viewCount', 'DESC']],
      limit,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'deliveryFee', 'status', 'ratingAvg', 'operatingHours'],
        },
      ],
    });
  },

  /**
   * Lấy chi tiết món ăn theo ID
   */
  findById: async (id: string): Promise<MenuItem | null> => {
    return await MenuItem.findOne({
      where: { id, isDeleted: false },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'deliveryFee', 'status', 'ratingAvg', 'operatingHours'],
        },
      ],
    });
  },

  /**
   * Tăng lượt xem sản phẩm
   */
  incrementViewCount: async (id: string): Promise<MenuItem | null> => {
    const item = await MenuItem.findByPk(id);
    if (item) {
      await item.increment('viewCount', { by: 1 });
      await item.reload();
    }
    return item;
  },
};

export default menuItemRepository;
