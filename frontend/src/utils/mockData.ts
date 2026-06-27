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
  coverImage?: string;
  operatingHours?: { open: string; close: string };
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
    coverImage: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80',
    operatingHours: { open: '06:00', close: '22:00' },
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
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80',
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80',
    operatingHours: { open: '07:00', close: '21:00' },
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
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80',
    coverImage: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80',
    operatingHours: { open: '14:00', close: '23:00' },
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
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=500&q=80',
    coverImage: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=1200&q=80',
    operatingHours: { open: '05:00', close: '20:00' },
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
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=500&q=80',
    coverImage: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80',
    operatingHours: { open: '06:30', close: '20:30' },
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
    imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=80',
    coverImage: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=1200&q=80',
    operatingHours: { open: '08:00', close: '22:00' },
    isOpen: true,
  },
  {
    id: 'rest-7',
    name: 'Phở Hòa Pasteur',
    address: '260C Pasteur, Quận 3',
    rating: 4.7,
    deliveryTime: '15-25 phút',
    deliveryFee: 20000,
    tags: ['pho'],
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
  },
  {
    id: 'rest-8',
    name: 'Bánh Mì Hồng Hoa',
    address: '54 Nguyễn Văn Tráng, Quận 1',
    rating: 4.8,
    deliveryTime: '10-20 phút',
    deliveryFee: 12000,
    tags: ['bread', 'snack'],
    imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
  },
  {
    id: 'rest-9',
    name: 'Sữa Tươi Trân Châu The Alley',
    address: '114 Hồ Tùng Mậu, Quận 1',
    rating: 4.5,
    deliveryTime: '12-18 phút',
    deliveryFee: 8000,
    tags: ['coffee'],
    imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
  },
  {
    id: 'rest-10',
    name: 'Bún Chả Sinh Từ',
    address: '18 Hàng Vải, Quận Hoàn Kiếm',
    rating: 4.6,
    deliveryTime: '15-20 phút',
    deliveryFee: 12000,
    tags: ['pho', 'snack'],
    imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=500&q=80',
    isOpen: true,
  },
  {
    id: 'rest-11',
    name: 'Trà Sữa Gong Cha',
    address: '78 Nguyễn Huệ, Quận 1',
    rating: 4.7,
    deliveryTime: '10-15 phút',
    deliveryFee: 10000,
    tags: ['coffee', 'dessert'],
    imageUrl: 'https://images.unsplash.com/photo-1558857563-b3719d367e5e?auto=format&fit=crop&w=500&q=80',
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
  image?: string;
  images: string[];
  isAvailable: boolean;
  stock: number;
  soldCount: number;
  category: string;
  viewCount?: number;
  toppings: Topping[];
  restaurantRating?: number;
  restaurantDeliveryFee?: number;
  restaurantIsOpen?: boolean;
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
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 25,
    soldCount: 342,
    category: 'pho',
    viewCount: 1250,
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
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: false,
    stock: 0,
    soldCount: 189,
    category: 'pho',
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
    imageUrl: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 5,
    soldCount: 88,
    category: 'snack',
    toppings: [
      { id: 'top-1', name: 'Thêm tương đen sa tế', price: 2000 },
      { id: 'top-2', name: 'Thêm tóp mỡ', price: 3000 },
    ],
  },
  {
    id: 'menu-4',
    restaurantId: 'rest-2',
    restaurantName: 'Cơm Tấm Bãi Rác Quận 4',
    name: 'Cơm Tấm Sườn Bì Chả Đặc Biệt',
    price: 65000,
    description: 'Sườn cốt lết dày dặn ướp mật ong nướng than hồng thơm phức, ăn kèm chả trứng chưng truyền thống, bì heo dai giòn trộn thính thơm và nước mắm kẹo ớt tỏi lý tưởng.',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 40,
    soldCount: 512,
    category: 'com',
    viewCount: 1890,
    toppings: [
      { id: 'top-5', name: 'Thêm trứng ốp la lòng đào', price: 7000 },
      { id: 'top-6', name: 'Thêm cây lạp xưởng Mai Quế Lộ', price: 12000 },
      { id: 'top-7', name: 'Thêm mỡ hành tóp mỡ', price: 3000 },
    ],
  },
  {
    id: 'menu-5',
    restaurantId: 'rest-2',
    restaurantName: 'Cơm Tấm Bãi Rác Quận 4',
    name: 'Cơm Tấm Ba Chỉ Nướng Lu',
    price: 55000,
    description: 'Thịt ba chỉ thái bản dày nướng trong lu đất giữ nguyên độ ngọt thơm của thịt, lớp da giòn bóng bẩy đậm đà hương vị truyền thống.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 15,
    soldCount: 204,
    category: 'com',
    toppings: [
      { id: 'top-5', name: 'Thêm trứng ốp la', price: 7000 },
      { id: 'top-7', name: 'Thêm mỡ hành', price: 2000 },
    ],
  },
  {
    id: 'menu-6',
    restaurantId: 'rest-3',
    restaurantName: 'Bột Chiên Trấn Giang Phùng Hưng',
    name: 'Bột Chiên Trứng Đôi Giòn Rụm',
    price: 35000,
    description: 'Từng viên bột chiên bên ngoài giòn tan, bên trong mềm dẻo quyện cùng 2 quả trứng gà béo ngậy, hành lá thơm lừng và đu đủ bào ngâm chua ngọt giải ngấy.',
    imageUrl: 'https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 30,
    soldCount: 415,
    category: 'snack',
    toppings: [
      { id: 'top-8', name: 'Thêm pa-tê chiên bơ', price: 10000 },
      { id: 'top-9', name: 'Thêm trứng gà chiên', price: 6000 },
    ],
  },
  {
    id: 'menu-7',
    restaurantId: 'rest-4',
    restaurantName: 'Cà Phê Vợt Ba Lù Chợ Phùng Hưng',
    name: 'Cà Phê Vợt Sữa Đá Sài Gòn',
    price: 22000,
    description: 'Ly cà phê vợt nóng hổi được pha chế qua chiếc vợt vải truyền thống tại khu Chợ Lớn hơn 70 năm tuổi, pha sữa đặc Ngôi Sao béo ngọt tạo nên hương vị bùi ngậy hoài cổ.',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 100,
    soldCount: 999,
    category: 'coffee',
    viewCount: 3100,
    toppings: [
      { id: 'top-10', name: 'Thêm sữa đặc béo', price: 4000 },
      { id: 'top-11', name: 'Thêm bạc xỉu nhiều sữa', price: 5000 },
    ],
  },
  {
    id: 'menu-8',
    restaurantId: 'rest-4',
    restaurantName: 'Cà Phê Vợt Ba Lù Chợ Phùng Hưng',
    name: 'Cà Phê Đen Vợt Đậm Đà',
    price: 18000,
    description: 'Hương vị cà phê đen truyền thống ngậy béo chưng cất bằng lò than, hậu vị đắng thanh dễ chịu chuẩn người Hoa Sài Gòn.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 120,
    soldCount: 650,
    category: 'coffee',
    toppings: [
      { id: 'top-10', name: 'Thêm chút sữa đặc', price: 3000 },
    ],
  },
  {
    id: 'menu-9',
    restaurantId: 'rest-5',
    restaurantName: 'Bánh Mì Huỳnh Hoa Sài Gòn',
    name: 'Bánh Mì Huỳnh Hoa Đặc Biệt (Ổ 0.5kg)',
    price: 62000,
    description: 'Ổ bánh mì đắt sắt ra miếng với 5 lớp nhân chả lụa, chả bò, giò thủ, chà bông heo hảo hạng cùng lớp bơ thơm béo ngậy và pa-tê gan siêu đặc biệt làm nên thương hiệu đệ nhất Sài Thành.',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=79',
    images: [
      'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=79'
    ],
    isAvailable: true,
    stock: 50,
    soldCount: 1540,
    category: 'bread',
    viewCount: 4500,
    toppings: [
      { id: 'top-12', name: 'Thêm Pa-tê Huỳnh Hoa cực béo', price: 15000 },
      { id: 'top-13', name: 'Thêm bơ vàng nhập khẩu', price: 10000 },
      { id: 'top-14', name: 'Thêm chà bông heo', price: 8000 },
    ],
  },
  {
    id: 'menu-10',
    restaurantId: 'rest-6',
    restaurantName: 'Chè Mâm Khánh Vy Sư Vạn Hạnh',
    name: 'Mâm Chè 16 Món Khánh Vy',
    price: 150000,
    description: 'Mâm chè khổng lồ mang thương hiệu chè chung cư Sư Vạn Hạnh bao gồm 16 loại chè: chè thưng, chè ba màu, chè trôi nước, chè khoai môn, bánh lọt cốt dừa béo ngậy...',
    imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 15,
    soldCount: 388,
    category: 'dessert',
    toppings: [
      { id: 'top-15', name: 'Thêm hũ nước cốt dừa sệt', price: 8000 },
      { id: 'top-16', name: 'Thêm đậu phộng rang giòn', price: 3000 },
    ],
  },
  {
    id: 'menu-11',
    restaurantId: 'rest-3',
    restaurantName: 'Bột Chiên Trấn Giang Phùng Hưng',
    name: 'Bánh Hẹ Chiên Giòn Độc Đáo',
    price: 25000,
    description: 'Lớp vỏ bánh dai dẻo làm từ bột nếp, nhân hẹ tươi thơm ngọt, chiên giòn rụm xém cạnh, ăn kèm nước tương đặc chế chua ngọt cực hấp dẫn.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 20,
    soldCount: 142,
    category: 'snack',
    toppings: [
      { id: 'top-8', name: 'Thêm pa-tê chiên bơ', price: 10000 },
    ],
  },
  {
    id: 'menu-12',
    restaurantId: 'rest-5',
    restaurantName: 'Bánh Mì Huỳnh Hoa Sài Gòn',
    name: 'Bánh Mì Pa-tê Xá Xíu Bơ Vàng',
    price: 50000,
    description: 'Phiên bản gọn gàng hơn của bánh mì Huỳnh Hoa với lát thịt xá xíu thơm phức, pa-tê gan siêu béo đặc trưng cùng lớp bơ vàng nhập khẩu thượng hạng.',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=78',
    images: [
      'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=78'
    ],
    isAvailable: true,
    stock: 35,
    soldCount: 420,
    category: 'bread',
    toppings: [
      { id: 'top-12', name: 'Thêm Pa-tê Huỳnh Hoa cực béo', price: 15000 },
      { id: 'top-14', name: 'Thêm chà bông heo', price: 8000 },
    ],
  },
  {
    id: 'menu-13',
    restaurantId: 'rest-6',
    restaurantName: 'Chè Mâm Khánh Vy Sư Vạn Hạnh',
    name: 'Chè Thái Sầu Riêng Đệ Nhất',
    price: 35000,
    description: 'Hương vị chè Thái mát lạnh với thạch dừa giòn giòn, mít chín ngọt lịm, nhãn tươi và đặc biệt là múi sầu riêng cơm vàng béo ngậy ngập trong nước cốt dừa.',
    imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 45,
    soldCount: 612,
    category: 'dessert',
    toppings: [
      { id: 'top-15', name: 'Thêm nước cốt dừa sệt', price: 8000 },
    ],
  },
  {
    id: 'menu-14',
    restaurantId: 'rest-7',
    restaurantName: 'Phở Hòa Pasteur',
    name: 'Phở Tái Gầu Nạm Bò Viên',
    price: 75000,
    description: 'Sự kết hợp hoàn hảo từ nước dùng phở bò Hòa trứ danh ninh 12 tiếng cùng thịt gầu bò giòn sần sật, thịt tái mềm mọng, nạm bò chín mềm và bò viên dai ngon bùi vị.',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 60,
    soldCount: 840,
    category: 'pho',
    toppings: [
      { id: 'top-17', name: 'Thêm chén tiết trứng gà', price: 15000 },
      { id: 'top-18', name: 'Thêm quẩy giòn (1 đĩa)', price: 7000 },
      { id: 'top-19', name: 'Thêm đĩa thịt bò thêm', price: 25000 },
    ],
  },
  {
    id: 'menu-15',
    restaurantId: 'rest-7',
    restaurantName: 'Phở Hòa Pasteur',
    name: 'Phở Gà Xé Lá Chanh Thơm Nồng',
    price: 65000,
    description: 'Thịt gà ta thả vườn dai ngọt xé phay giòn giòn, da gà vàng óng bóng bẩy quyện cùng lá chanh cắt sợi mỏng thơm thanh mát.',
    imageUrl: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 25,
    soldCount: 310,
    category: 'pho',
    toppings: [
      { id: 'top-18', name: 'Thêm quẩy giòn', price: 7000 },
      { id: 'top-20', name: 'Lòng gà thêm', price: 20000 },
    ],
  },
  {
    id: 'menu-16',
    restaurantId: 'rest-8',
    restaurantName: 'Bánh Mì Hồng Hoa',
    name: 'Bánh Mì Thịt Nướng Bơ Tỏi',
    price: 30000,
    description: 'Ổ bánh mì nóng giòn rụm kẹp thịt nướng xiên que thơm nức mũi, sốt bơ tỏi nhà làm béo ngậy kèm nước sốt ớt cay nhẹ kích thích vị giác.',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 80,
    soldCount: 720,
    category: 'bread',
    toppings: [
      { id: 'top-21', name: 'Thêm lát thịt nướng', price: 8000 },
      { id: 'top-22', name: 'Thêm bơ tỏi thơm', price: 4000 },
    ],
  },
  {
    id: 'menu-17',
    restaurantId: 'rest-9',
    restaurantName: 'Sữa Tươi Trân Châu The Alley',
    name: 'Sữa Tươi Trân Châu Đường Đen Thượng Hạng',
    price: 65000,
    description: 'Dòng sữa tươi nguyên chất thanh trùng hòa quyện cùng trân châu thủ công dẻo dai nấu trong sốt mật mía đường đen ngọt thanh thơm lừng.',
    imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 150,
    soldCount: 2450,
    category: 'coffee',
    viewCount: 5200,
    toppings: [
      { id: 'top-23', name: 'Thêm trân châu đường đen', price: 10000 },
      { id: 'top-24', name: 'Thêm pudding trứng mềm mịn', price: 12000 },
    ],
  },
  {
    id: 'menu-18',
    restaurantId: 'rest-10',
    restaurantName: 'Bún Chả Sinh Từ',
    name: 'Bún Chả Nem Cua Bể Đặc Biệt',
    price: 55000,
    description: 'Bún tươi mềm mại ăn kèm chả nướng than hoa thơm lừng và nem cua bể giòn tan ngon miệng ngọt ngào chuẩn vị Hà Nội phố cổ.',
    imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 30,
    soldCount: 412,
    category: 'pho',
    toppings: [
      { id: 'top-18', name: 'Thêm quẩy giòn', price: 7000 },
      { id: 'top-25', name: 'Thêm nem cua bể (1 chiếc)', price: 15000 },
    ],
  },
  {
    id: 'menu-19',
    restaurantId: 'rest-11',
    restaurantName: 'Trà Sữa Gong Cha',
    name: 'Trà Sữa Trân Châu Hoàng Gia Size L',
    price: 52000,
    description: 'Trà sữa ô long béo ngậy chuẩn Gong Cha với lớp bọt béo thơm ngon cùng trân châu đen ngâm mật ong ngọt dẻo dai giòn bùi vị.',
    imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=79',
    images: [
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=79'
    ],
    isAvailable: true,
    stock: 120,
    soldCount: 1650,
    category: 'coffee',
    toppings: [
      { id: 'top-23', name: 'Thêm trân châu đen', price: 8000 },
      { id: 'top-26', name: 'Thêm thạch sương sáo', price: 8000 },
    ],
  }
];
