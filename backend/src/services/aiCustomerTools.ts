import { MenuItem } from '../models/MenuItem';
import { Cart } from '../models/Cart';
import { CartItem } from '../models/CartItem';
import { Op } from 'sequelize';

export const aiCustomerTools = {
  searchMenuItems: async (query: string, maxPrice?: number) => {
    // Basic text search for MVP
    const whereClause: any = {
      isAvailable: true,
      isDeleted: false,
    };

    if (query && query.trim() !== '') {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { category: { [Op.like]: `%${query}%` } }
      ];
    }

    if (maxPrice) {
      whereClause.price = { [Op.lte]: maxPrice };
    }

    const items = await MenuItem.findAll({
      where: whereClause,
      limit: 100,
      attributes: ['id', 'name', 'description', 'price', 'restaurantId', 'category']
    });

    if (items.length === 0) return [];

    // Group items by restaurantId
    const itemsByRestaurant = items.reduce((acc: any, item) => {
      if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
      acc[item.restaurantId].push(item);
      return acc;
    }, {});

    // Find the restaurant with the most items
    let maxRestaurantId = Object.keys(itemsByRestaurant)[0];
    let maxItemsCount = itemsByRestaurant[maxRestaurantId].length;

    for (const rId in itemsByRestaurant) {
      if (itemsByRestaurant[rId].length > maxItemsCount) {
        maxItemsCount = itemsByRestaurant[rId].length;
        maxRestaurantId = rId;
      }
    }

    // Chỉ trả về các món của 1 nhà hàng duy nhất để AI không bị nhầm lẫn
    return itemsByRestaurant[maxRestaurantId];
  },

  addItemsToCart: async (userId: string, itemsToAdd: { menuItemId: string, quantity: number, restaurantId: string }[]) => {
    if (!itemsToAdd || itemsToAdd.length === 0) return { status: 'failed', message: 'No items provided' };

    // Get or create cart for user
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId, restaurantId: itemsToAdd[0].restaurantId });
    } else if (cart.restaurantId && cart.restaurantId !== itemsToAdd[0].restaurantId) {
      // Must clear cart if different restaurant (Food Delivery standard)
      await CartItem.destroy({ where: { cartId: cart.id } });
      cart.restaurantId = itemsToAdd[0].restaurantId;
      await cart.save();
    }

    for (const item of itemsToAdd) {
      const existingItem = await CartItem.findOne({
        where: { cartId: cart.id, menuItemId: item.menuItemId }
      });

      if (existingItem) {
        existingItem.quantity += item.quantity;
        await existingItem.save();
      } else {
        await CartItem.create({
          cartId: cart.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity
        });
      }
    }

    return { status: 'success', message: `Đã thêm ${itemsToAdd.length} loại món ăn vào giỏ hàng.` };
  }
};
