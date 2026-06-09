import { Cart } from '../models/Cart';
import { CartItem } from '../models/CartItem';
import { MenuItem } from '../models/MenuItem';
import { AppError } from '../middlewares/errorHandler';

export const cartService = {
  /**
   * Lấy chi tiết giỏ hàng của người dùng (bao gồm danh sách món ăn)
   */
  getCart: async (userId: string): Promise<Cart> => {
    let cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [MenuItem], // Nạp chi tiết món ăn kèm theo
        },
      ],
    });

    // Nếu chưa có giỏ hàng thì tự động tạo mới
    if (!cart) {
      cart = await Cart.create({ userId });
      cart.items = [];
    }

    return cart;
  },

  /**
   * Thêm món ăn vào giỏ hàng
   */
  addToCart: async (userId: string, menuItemId: string, quantity = 1): Promise<Cart> => {
    const item = await MenuItem.findByPk(menuItemId);
    if (!item) {
      throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy món ăn yêu cầu.');
    }
    if (!item.isAvailable || item.isDeleted) {
      throw new AppError(400, 'BUSINESS_ERROR', 'Món ăn này hiện không còn phục vụ.');
    }

    const cart = await cartService.getCart(userId);

    // 1. Kiểm tra xem giỏ hàng đang trống hay đã có món ăn
    if (!cart.restaurantId) {
      // Giỏ hàng trống: Thiết lập restaurantId của giỏ hàng là nhà hàng của món ăn này
      cart.restaurantId = item.restaurantId;
      await cart.save();
    } else if (cart.restaurantId !== item.restaurantId) {
      // Khác nhà hàng: Trả về lỗi yêu cầu xác nhận xóa giỏ cũ
      throw new AppError(
        400,
        'BUSINESS_ERROR',
        'Giỏ hàng đã chứa món ăn của nhà hàng khác. Bạn cần dọn sạch giỏ hàng hiện tại trước khi đặt món ở nhà hàng mới.'
      );
    }

    // 2. Kiểm tra xem món ăn đã có trong giỏ chưa
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, menuItemId },
    });

    if (cartItem) {
      // Đã có: Cộng dồn số lượng
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Chưa có: Tạo mới item con
      await CartItem.create({
        cartId: cart.id,
        menuItemId,
        quantity,
      });
    }

    return cartService.getCart(userId);
  },

  /**
   * Cập nhật số lượng của một món ăn trong giỏ
   */
  updateQuantity: async (userId: string, menuItemId: string, quantity: number): Promise<Cart> => {
    const cart = await cartService.getCart(userId);

    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, menuItemId },
    });

    if (!cartItem) {
      throw new AppError(404, 'NOT_FOUND', 'Món ăn không tồn tại trong giỏ hàng.');
    }

    if (quantity <= 0) {
      // Nếu số lượng <= 0: Xóa hẳn món khỏi giỏ
      await cartItem.destroy();
    } else {
      cartItem.quantity = quantity;
      await cartItem.save();
    }

    // Cập nhật lại restaurant_id của Cart nếu giỏ hàng rỗng sau khi xóa
    const remainingItems = await CartItem.count({ where: { cartId: cart.id } });
    if (remainingItems === 0) {
      cart.restaurantId = undefined;
      await cart.save();
    }

    return cartService.getCart(userId);
  },

  /**
   * Xóa một món ăn khỏi giỏ hàng
   */
  removeFromCart: async (userId: string, menuItemId: string): Promise<Cart> => {
    return cartService.updateQuantity(userId, menuItemId, 0);
  },

  /**
   * Dọn dẹp sạch sẽ toàn bộ giỏ hàng
   */
  clearCart: async (userId: string): Promise<void> => {
    const cart = await Cart.findOne({ where: { userId } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
      cart.restaurantId = undefined;
      await cart.save();
    }
  },
};

export default cartService;
