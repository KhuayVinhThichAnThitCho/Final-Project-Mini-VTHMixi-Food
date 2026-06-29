import { Cart } from '../models/Cart';
import { CartItem } from '../models/CartItem';
import { MenuItem } from '../models/MenuItem';
import { Restaurant } from '../models/Restaurant';
import { AppError } from '../middlewares/errorHandler';

export const cartService = {
  /**
   * Lấy chi tiết giỏ hàng của người dùng (bao gồm danh sách món ăn và thông tin nhà hàng tương ứng)
   */
  getCart: async (userId: string): Promise<Cart> => {
    let cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [
            {
              model: MenuItem,
              include: [Restaurant], // Tải kèm thông tin nhà hàng để hiển thị trên frontend
            },
          ],
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

    // Cập nhật restaurantId của giỏ hàng sang nhà hàng của món vừa thêm nếu có sự thay đổi
    // Lưu ý: Không xóa các món ăn của nhà hàng cũ (cho phép tồn tại song song)
    if (cart.restaurantId !== item.restaurantId) {
      cart.restaurantId = item.restaurantId;
      await cart.save();
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
      cart.restaurantId = null;
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
      cart.restaurantId = null;
      await cart.save();
    }
  },
};

export default cartService;
