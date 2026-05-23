import { IUser } from '../models/User';

// Mẫu danh sách dữ liệu giả lập trong bộ nhớ
let usersMock: IUser[] = [];

export const userRepository = {
  /**
   * Tìm kiếm người dùng bằng Email
   */
  findByEmail: async (email: string): Promise<IUser | null> => {
    const user = usersMock.find((u) => u.email === email.toLowerCase());
    return user || null;
  },

  /**
   * Tìm kiếm người dùng bằng ID
   */
  findById: async (id: string): Promise<IUser | null> => {
    const user = usersMock.find((u) => u.id === id);
    return user || null;
  },

  /**
   * Khởi tạo người dùng mới
   */
  create: async (userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> => {
    const newUser: IUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    usersMock.push(newUser);
    return newUser;
  },

  /**
   * Cập nhật thông tin người dùng
   */
  update: async (id: string, updateData: Partial<IUser>): Promise<IUser | null> => {
    const index = usersMock.findIndex((u) => u.id === id);
    if (index === -1) return null;

    usersMock[index] = {
      ...usersMock[index],
      ...updateData,
      updatedAt: new Date(),
    };
    return usersMock[index];
  },
};
