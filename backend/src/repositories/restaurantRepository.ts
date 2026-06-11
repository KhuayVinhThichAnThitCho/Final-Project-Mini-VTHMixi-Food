import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Op } from 'sequelize';

export const restaurantRepository = {
  /**
   * Lấy danh sách nhà hàng có lọc và phân trang
   */
  findAll: async (
    filters: { minRating?: number; maxDeliveryFee?: number; isOpenOnly?: boolean; sortBy?: string },
    offset: number,
    limit: number
  ) => {
    const whereClause: any = { status: { [Op.ne]: 'banned' } };
    if (filters.minRating && filters.minRating > 0) {
      whereClause.ratingAvg = { [Op.gte]: filters.minRating };
    }
    if (filters.maxDeliveryFee && filters.maxDeliveryFee > 0) {
      whereClause.deliveryFee = { [Op.lte]: filters.maxDeliveryFee };
    }
    if (filters.isOpenOnly) {
      whereClause.status = 'open';
    }
    let order: any[] = [['created_at', 'DESC']];
    if (filters.sortBy === 'rating') order = [['ratingAvg', 'DESC']];
    if (filters.sortBy === 'delivery_fee_asc') order = [['deliveryFee', 'ASC']];
    const { rows, count } = await Restaurant.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order,
    });
    return { restaurants: rows, total: count };
  },

  /**
   * Lấy chi tiết nhà hàng kèm danh sách món ăn
   */
  findById: async (id: string) => {
    return await Restaurant.findByPk(id, {
      include: [
        {
          model: MenuItem,
          as: 'menuItems',
          where: { isDeleted: false, isAvailable: true },
          required: false,
          order: [['soldCount', 'DESC']],
        },
      ],
    });
  },

  /**
   * Tìm kiếm nhà hàng theo tên hoặc địa chỉ
   */
  search: async (query: string, limit: number = 10) => {
    return await Restaurant.findAll({
      where: {
        status: { [Op.ne]: 'banned' },
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { address: { [Op.like]: `%${query}%` } },
        ],
      },
      limit,
      order: [['ratingAvg', 'DESC']],
    });
  },
};

export default restaurantRepository;
