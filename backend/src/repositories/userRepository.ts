import { User } from '../models/User';

export const userRepository = {
  /**
   * Tìm kiếm người dùng bằng Email
   */
  findByEmail: async (email: string): Promise<User | null> => {
    return await User.findOne({ where: { email: email.toLowerCase() } });
  },

  /**
   * Tìm kiếm người dùng bằng ID
   */
  findById: async (id: string): Promise<User | null> => {
    return await User.findByPk(id);
  },

  /**
   * Khởi tạo người dùng mới
   */
  create: async (userData: any): Promise<User> => {
    return await User.create(userData);
  },

  /**
   * Cập nhật thông tin người dùng
   */
  update: async (id: string, updateData: Partial<User>): Promise<User | null> => {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.update(updateData);
    return user;
  },
};
