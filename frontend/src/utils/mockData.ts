export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
}

export interface RestaurantData {
  id: string;
  name: string;
  address: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  tags: string[];
  imageUrl: string;
  isOpen: boolean;
}

export const MOCK_CATEGORIES: FoodCategory[] = [
  { id: 'all', name: 'Tất cả món', icon: '🍽️' },
  { id: 'pho', name: 'Phở & Bún', icon: '🍜' },
  { id: 'com', name: 'Cơm Tấm', icon: '🍗' },
  { id: 'coffee', name: 'Cà Phê Vợt', icon: '☕' },
  { id: 'snack', name: 'Ăn Vặt Hẻm', icon: '🍡' },
  { id: 'dessert', name: 'Chè Ngọt', icon: '🍧' },
  { id: 'bread', name: 'Bánh Mì Sài Gòn', icon: '🥖' },
];

export const MOCK_RESTAURANTS: RestaurantData[] = [
  {
    id: 'rest-1',
    name: 'Hủ Tiếu Gõ Chợ Bàn Cờ',
    address: 'Hẻm 174 Nguyễn Thiện Thuật, Quận 3',
    rating: 4.8,
    deliveryTime: '15-20 phút',
    deliveryFee: 15000,
    tags: ['pho', 'snack'],
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
  },
  {
    id: 'rest-2',
    name: 'Cơm Tấm Bãi Rác Quận 4',
    address: '73 Lê Văn Linh, Quận 4, Sài Gòn',
    rating: 4.6,
    deliveryTime: '20-25 phút',
    deliveryFee: 18000,
    tags: ['com'],
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
  },
  {
    id: 'rest-3',
    name: 'Bột Chiên Trấn Giang Phùng Hưng',
    address: 'Đầu hẻm Phùng Hưng, Quận 5',
    rating: 4.5,
    deliveryTime: '25-30 phút',
    deliveryFee: 12000,
    tags: ['snack'],
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80',
    isOpen: false,
  },
  {
    id: 'rest-4',
    name: 'Cà Phê Vợt Ba Lù Chợ Phùng Hưng',
    address: 'Hẻm 192 Phùng Hưng, Quận 5',
    rating: 4.9,
    deliveryTime: '10-15 phút',
    deliveryFee: 10000,
    tags: ['coffee', 'dessert'],
    imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
  },
  {
    id: 'rest-5',
    name: 'Bánh Mì Huỳnh Hoa Sài Gòn',
    address: '26 Lê Thị Riêng, Quận 1',
    rating: 4.7,
    deliveryTime: '30-35 phút',
    deliveryFee: 22000,
    tags: ['bread'],
    imageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
  },
  {
    id: 'rest-6',
    name: 'Chè Mâm Khánh Vy Sư Vạn Hạnh',
    address: 'Chung cư Ngô Gia Tự, Quận 10',
    rating: 4.4,
    deliveryTime: '20-30 phút',
    deliveryFee: 15000,
    tags: ['dessert', 'snack'],
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
  },
];

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemDetail {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  toppings: Topping[];
}

export const MOCK_MENU_ITEMS: MenuItemDetail[] = [
  {
    id: 'menu-1',
    restaurantId: 'rest-1',
    restaurantName: 'Hủ Tiếu Gõ Chợ Bàn Cờ',
    name: 'Hủ Tiếu Mì Sườn Heo Đặc Biệt',
    price: 45000,
    description: 'Sợi hủ tiếu dai ngon kết hợp cùng mì tươi, sườn non ninh mềm ngọt nước dùng xương ống ninh 8 tiếng chuẩn vị Sài Gòn xưa. Ăn kèm tóp mỡ giòn rụm và hành phi thơm lừng.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: [
      { id: 'top-1', name: 'Thêm trứng cút (3 quả)', price: 5000 },
      { id: 'top-2', name: 'Thêm tôm sú tươi', price: 15000 },
      { id: 'top-3', name: 'Thêm tóp mỡ sa tế', price: 3000 },
      { id: 'top-4', name: 'Sợi hủ tiếu thêm', price: 8000 },
    ],
  },
  {
    id: 'menu-2',
    restaurantId: 'rest-1',
    restaurantName: 'Hủ Tiếu Gõ Chợ Bàn Cờ',
    name: 'Hủ Tiếu Mì Hoành Thánh',
    price: 40000,
    description: 'Hoành thánh nhân thịt heo và tôm xay nhuyễn gói trong lớp vỏ bột vàng dai, nước dùng hẹ xanh thanh mát ngọt thanh.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    isAvailable: false,
    toppings: [
      { id: 'top-1', name: 'Thêm hoành thánh (3 cái)', price: 10000 },
      { id: 'top-2', name: 'Thêm xá xíu', price: 12000 },
    ],
  },
  {
    id: 'menu-3',
    restaurantId: 'rest-1',
    restaurantName: 'Hủ Tiếu Gõ Chợ Bàn Cờ',
    name: 'Xí Quách Tô Đặc Biệt',
    price: 30000,
    description: 'Xương ống tủy béo ngậy ninh ngọt lịm chấm cùng tương đen pha sa tế cay nồng ấm bụng.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    toppings: [
      { id: 'top-1', name: 'Thêm tương đen sa tế', price: 2000 },
      { id: 'top-2', name: 'Thêm tóp mỡ', price: 3000 },
    ],
  },
];
