import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { SystemConfig } from '../models/SystemConfig';
import { Voucher } from '../models/Voucher';

const SEED_RESTAURANTS = [
  {
    id: 'rest-1',
    name: 'Hủ Tiếu Gõ Chợ Bàn Cờ',
    address: 'Hẻm 174 Nguyễn Thiện Thuật, Quận 3',
    rating: 4.8,
    deliveryFee: 15000,
    isOpen: true,
  },
  {
    id: 'rest-2',
    name: 'Cơm Tấm Bãi Rác Quận 4',
    address: '73 Lê Văn Linh, Quận 4, Sài Gòn',
    rating: 4.6,
    deliveryFee: 18000,
    isOpen: true,
  },
  {
    id: 'rest-3',
    name: 'Bột Chiên Trấn Giang Phùng Hưng',
    address: 'Đầu hẻm Phùng Hưng, Quận 5',
    rating: 4.5,
    deliveryFee: 12000,
    isOpen: false,
  },
  {
    id: 'rest-4',
    name: 'Cà Phê Vợt Ba Lù Chợ Phùng Hưng',
    address: 'Hẻm 192 Phùng Hưng, Quận 5',
    rating: 4.9,
    deliveryFee: 10000,
    isOpen: true,
  },
  {
    id: 'rest-5',
    name: 'Bánh Mì Huỳnh Hoa Sài Gòn',
    address: '26 Lê Thị Riêng, Quận 1',
    rating: 4.7,
    deliveryFee: 22000,
    isOpen: true,
  },
  {
    id: 'rest-6',
    name: 'Chè Mâm Khánh Vy Sư Vạn Hạnh',
    address: 'Chung cư Ngô Gia Tự, Quận 10',
    rating: 4.4,
    deliveryFee: 15000,
    isOpen: true,
  },
  {
    id: 'rest-7',
    name: 'Phở Hòa Pasteur',
    address: '260C Pasteur, Quận 3',
    rating: 4.7,
    deliveryFee: 20000,
    isOpen: true,
  },
  {
    id: 'rest-8',
    name: 'Bánh Mì Hồng Hoa',
    address: '54 Nguyễn Văn Tráng, Quận 1',
    rating: 4.8,
    deliveryFee: 12000,
    isOpen: true,
  },
  {
    id: 'rest-9',
    name: 'Sữa Tươi Trân Châu The Alley',
    address: '114 Hồ Tùng Mậu, Quận 1',
    rating: 4.5,
    deliveryFee: 8000,
    isOpen: true,
  },
  {
    id: 'rest-10',
    name: 'Bún Chả Sinh Từ',
    address: '18 Hàng Vải, Quận Hoàn Kiếm',
    rating: 4.6,
    deliveryFee: 12000,
    isOpen: true,
  },
  {
    id: 'rest-11',
    name: 'Trà Sữa Gong Cha',
    address: '78 Nguyễn Huệ, Quận 1',
    rating: 4.7,
    deliveryFee: 10000,
    isOpen: true,
  },
  {
    id: 'rest-central',
    name: 'Quán Ăn Miền Trung O Nở',
    address: '145 Bành Văn Trân, Tân Bình, TP.HCM',
    rating: 4.8,
    deliveryFee: 15000,
    isOpen: true,
  },
];


const SEED_MENU_ITEMS = [
  {
    id: 'menu-1',
    restaurantId: 'rest-1',
    name: 'Hủ Tiếu Mì Sườn Heo Đặc Biệt',
    price: 45000,
    description: 'Sợi hủ tiếu dai ngon kết hợp cùng mì tươi, sườn non ninh mềm ngọt nước dùng xương ống ninh 8 tiếng chuẩn vị Sài Gòn xưa.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 25,
    soldCount: 342,
    category: 'pho',
    viewCount: 1250,
  },
  {
    id: 'menu-2',
    restaurantId: 'rest-1',
    name: 'Hủ Tiếu Mì Hoành Thánh',
    price: 40000,
    description: 'Hoành thánh nhân thịt heo và tôm xay nhuyễn gói trong lớp vỏ bột vàng dai, nước dùng hẹ xanh thanh mát ngọt thanh.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: false,
    stock: 0,
    soldCount: 189,
    category: 'pho',
    viewCount: 95,
  },
  {
    id: 'menu-3',
    restaurantId: 'rest-1',
    name: 'Xí Quách Tô Đặc Biệt',
    price: 30000,
    description: 'Xương ống tủy béo ngậy ninh ngọt lịm chấm cùng tương đen pha sa tế cay nồng ấm bụng.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 5,
    soldCount: 88,
    category: 'snack',
    viewCount: 420,
  },
  {
    id: 'menu-4',
    restaurantId: 'rest-2',
    name: 'Cơm Tấm Sườn Bì Chả Đặc Biệt',
    price: 65000,
    description: 'Sườn cốt lết dày dặn ướp mật ong nướng than hồng thơm phức, ăn kèm chả trứng chưng truyền thống, bì heo dai giòn trộn thính thơm.',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 40,
    soldCount: 512,
    category: 'com',
    viewCount: 1890,
  },
  {
    id: 'menu-5',
    restaurantId: 'rest-2',
    name: 'Cơm Tấm Ba Chỉ Nướng Lu',
    price: 55000,
    description: 'Thịt ba chỉ thái bản dày nướng trong lu đất giữ nguyên độ ngọt thơm của thịt, lớp da giòn bóng bẩy.',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 15,
    soldCount: 204,
    category: 'com',
    viewCount: 780,
  },
  {
    id: 'menu-6',
    restaurantId: 'rest-3',
    name: 'Bột Chiên Trứng Đôi Giòn Rụm',
    price: 35000,
    description: 'Từng viên bột chiên bên ngoài giòn tan, bên trong mềm dẻo quyện cùng 2 quả trứng gà béo ngậy, hành lá thơm lừng.',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 30,
    soldCount: 415,
    category: 'snack',
    viewCount: 1100,
  },
  {
    id: 'menu-7',
    restaurantId: 'rest-4',
    name: 'Cà Phê Vợt Sữa Đá Sài Gòn',
    price: 22000,
    description: 'Ly cà phê vợt nóng hổi được pha chế qua chiếc vợt vải truyền thống tại khu Chợ Lớn hơn 70 năm tuổi, pha sữa đặc béo ngọt.',
    imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 100,
    soldCount: 999,
    category: 'coffee',
    viewCount: 3100,
  },
  {
    id: 'menu-8',
    restaurantId: 'rest-4',
    name: 'Cà Phê Đen Vợt Đậm Đà',
    price: 18000,
    description: 'Hương vị cà phê đen truyền thống ngậy béo chưng cất bằng lò than, hậu vị đắng thanh dễ chịu chuẩn người Hoa Sài Gòn.',
    imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 120,
    soldCount: 650,
    category: 'coffee',
    viewCount: 1540,
  },
  {
    id: 'menu-9',
    restaurantId: 'rest-5',
    name: 'Bánh Mì Huỳnh Hoa Đặc Biệt (Ổ 0.5kg)',
    price: 62000,
    description: 'Ổ bánh mì đắt sắt ra miếng với 5 lớp nhân chả lụa, chả bò, giò thủ, chà bông heo hảo hạng cùng lớp bơ thơm béo ngậy.',
    imageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 50,
    soldCount: 1540,
    category: 'bread',
    viewCount: 4500,
  },
  {
    id: 'menu-10',
    restaurantId: 'rest-6',
    name: 'Mâm Chè 16 Món Khánh Vy',
    price: 150000,
    description: 'Mâm chè khổng lồ mang thương hiệu chè chung cư Sư Vạn Hạnh bao gồm 16 loại chè khác nhau.',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 15,
    soldCount: 388,
    category: 'dessert',
    viewCount: 890,
  },
  {
    id: 'menu-11',
    restaurantId: 'rest-3',
    name: 'Bánh Hẹ Chiên Giòn Độc Đáo',
    price: 25000,
    description: 'Lớp vỏ bánh dai dẻo làm từ bột nếp, nhân hẹ tươi thơm ngọt, chiên giòn rụm xém cạnh.',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 20,
    soldCount: 142,
    category: 'snack',
    viewCount: 320,
  },
  {
    id: 'menu-12',
    restaurantId: 'rest-5',
    name: 'Bánh Mì Pa-tê Xá Xíu Bơ Vàng',
    price: 50000,
    description: 'Phiên bản gọn gàng hơn của bánh mì Huỳnh Hoa với lát thịt xá xíu thơm phức, pa-tê gan siêu béo đặc trưng.',
    imageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 35,
    soldCount: 420,
    category: 'bread',
    viewCount: 980,
  },
  {
    id: 'menu-13',
    restaurantId: 'rest-6',
    name: 'Chè Thái Sầu Riêng Đệ Nhất',
    price: 35000,
    description: 'Hương vị chè Thái mát lạnh với thạch dừa giòn giòn, mít chín ngọt lịm, nhãn tươi và sầu riêng cơm vàng béo ngậy.',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 45,
    soldCount: 612,
    category: 'dessert',
    viewCount: 1450,
  },
  {
    id: 'menu-14',
    restaurantId: 'rest-7',
    name: 'Phở Tái Gầu Nạm Bò Viên',
    price: 75000,
    description: 'Sự kết hợp hoàn hảo từ nước dùng phở bò Hòa trứ danh ninh 12 tiếng cùng thịt gầu bò giòn sần sật, thịt tái mềm mọng.',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 60,
    soldCount: 840,
    category: 'pho',
    viewCount: 2200,
  },
  {
    id: 'menu-15',
    restaurantId: 'rest-7',
    name: 'Phở Gà Xé Lá Chanh Thơm Nồng',
    price: 65000,
    description: 'Thịt gà ta thả vườn dai ngọt xé phay giòn giòn, da gà vàng óng bóng bẩy quyện cùng lá chanh cắt sợi mỏng.',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 25,
    soldCount: 310,
    category: 'pho',
    viewCount: 750,
  },
  {
    id: 'menu-16',
    restaurantId: 'rest-8',
    name: 'Bánh Mì Thịt Nướng Bơ Tỏi',
    price: 30000,
    description: 'Ổ bánh mì nóng giòn rụm kẹp thịt nướng xiên que thơm nức mũi, sốt bơ tỏi nhà làm béo ngậy.',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 80,
    soldCount: 720,
    category: 'bread',
    viewCount: 1650,
  },
  {
    id: 'menu-17',
    restaurantId: 'rest-9',
    name: 'Sữa Tươi Trân Châu Đường Đen Thượng Hạng',
    price: 65000,
    description: 'Dòng sữa tươi nguyên chất thanh trùng hòa quyện cùng trân châu thủ công dẻo dai nấu trong sốt mật mía đường đen.',
    imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 150,
    soldCount: 2450,
    category: 'coffee',
    viewCount: 5200,
  },
  {
    id: 'menu-18',
    restaurantId: 'rest-10',
    name: 'Bún Chả Nem Cua Bể Đặc Biệt',
    price: 55000,
    description: 'Bún tươi mềm mại ăn kèm chả nướng than hoa thơm lừng và nem cua bể giòn tan ngon miệng ngọt ngào.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 30,
    soldCount: 412,
    category: 'pho',
    viewCount: 980,
  },
  {
    id: 'menu-19',
    restaurantId: 'rest-11',
    name: 'Trà Sữa Trân Châu Hoàng Gia Size L',
    price: 52000,
    description: 'Trà sữa ô long béo ngậy chuẩn Gong Cha với lớp bọt béo thơm ngon cùng trân châu đen ngâm mật ong.',
    imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    stock: 120,
    soldCount: 1650,
    category: 'coffee',
    viewCount: 2900,
  },
  {
    id: 'menu-central-1',
    restaurantId: 'rest-central',
    name: 'Bún Bò Huế Đặc Biệt',
    price: 50000,
    description: 'Sợi bún to, thịt bò nạm, chả cua Huế thơm nồng, nước dùng đậm đà, cay xè đặc trưng vị Huế.',
    imageUrl: '',
    images: [],
    isAvailable: true,
    stock: 50,
    soldCount: 142,
    category: 'pho',
    viewCount: 320,
  },
  {
    id: 'menu-central-2',
    restaurantId: 'rest-central',
    name: 'Mì Quảng Gà Ta',
    price: 45000,
    description: 'Sợi mì Quảng vàng dai ngon kết hợp thịt gà ta dai ngọt, nước lèo xâm xấp đậm đà ăn kèm bánh đa giòn rụm và rau sống ngon chuẩn vị miền Trung.',
    imageUrl: '',
    images: [],
    isAvailable: true,
    stock: 40,
    soldCount: 98,
    category: 'pho',
    viewCount: 210,
  },
  {
    id: 'menu-central-3',
    restaurantId: 'rest-central',
    name: 'Bánh Bèo Chén Miền Trung',
    price: 35000,
    description: 'Mâm bánh bèo chén nhân tôm chấy, mỡ hành beo béo ăn kèm nước mắm ớt tỏi Lý Sơn cay mặn đậm đà.',
    imageUrl: '',
    images: [],
    isAvailable: true,
    stock: 30,
    soldCount: 180,
    category: 'snack',
    viewCount: 420,
  },
  {
    id: 'menu-central-4',
    restaurantId: 'rest-central',
    name: 'Bún Lòng Nghệ Xào Hẹ',
    price: 40000,
    description: 'Bún xào lòng heo tươi giòn quyện với bột nghệ vàng tươi, hẹ lá thơm nồng nàn cay ấm bụng đúng vị miền Trung mặn mà.',
    imageUrl: '',
    images: [],
    isAvailable: true,
    stock: 25,
    soldCount: 65,
    category: 'pho',
    viewCount: 180,
  },
];


export const seedDatabase = async () => {
  try {
    const restaurantCount = await Restaurant.count();
    const adminExists = await User.findOne({ where: { role: 'admin' } });

    // Luôn tạo admin nếu chưa có, ngay cả khi DB đã có data
    if (!adminExists) {
      await User.create({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Super Admin',
        email: 'admin@grabfood.com',
        password: 'Admin@123456',  // Trong thực tế phải dùng bcrypt.hash()
        role: 'admin',
        status: 'active',
        phone: '0900000001',
      });
      console.log('✅ Tạo tài khoản Admin thành công! Email: admin@grabfood.com | Pass: Admin@123456');
    }

    // Tạo Manager nếu chưa có
    const managerExists = await User.findOne({ where: { role: 'manager' } });
    if (!managerExists) {
      await User.create({
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Platform Manager',
        email: 'manager@grabfood.com',
        password: 'Manager@123456',
        role: 'manager',
        status: 'active',
        phone: '0900000002',
      });
      console.log('✅ Tạo tài khoản Manager thành công! Email: manager@grabfood.com | Pass: Manager@123456');
    }

    // Tạo User thường mẫu nếu chưa có
    const userExists = await User.findOne({ where: { email: 'user@grabfood.com' } });
    if (!userExists) {
      await User.create({
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Nguyễn Văn User',
        email: 'user@grabfood.com',
        password: 'User@123456',
        role: 'user',
        status: 'active',
        phone: '0900000003',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      });
      console.log('✅ Tạo tài khoản User mẫu thành công! Email: user@grabfood.com | Pass: User@123456');
    }

    // ── Seed System Config (A-07) ─────────────────────────────
    const configCount = await SystemConfig.count();
    if (configCount === 0) {
      await SystemConfig.bulkCreate([
        {
          key: 'platform_fee',
          value: JSON.stringify(5),
          group: 'fee',
          description: 'Phí nền tảng tính trên tổng đơn hàng (%)',
        },
        {
          key: 'payment_methods',
          value: JSON.stringify({ COD: true, WALLET: true, POINTS: true }),
          group: 'payment',
          description: 'Các phương thức thanh toán được kích hoạt',
        },
        {
          key: 'homepage_banner',
          value: JSON.stringify({
            title: 'GrabFood Mini',
            subtitle: 'Đặt đồ ăn ngon, giao tận nơi',
            imageUrl: '',
            linkUrl: '',
            isActive: true,
          }),
          group: 'banner',
          description: 'Cấu hình banner trang chủ',
        },
        {
          key: 'system_notice',
          value: JSON.stringify({
            message: '',
            type: 'info',
            isActive: false,
          }),
          group: 'notice',
          description: 'Thông báo hệ thống hiển thị cho toàn bộ người dùng',
        },
        {
          key: 'min_order_amount',
          value: JSON.stringify(20000),
          group: 'fee',
          description: 'Giá trị đơn hàng tối thiểu (VNĐ)',
        },
        {
          key: 'free_delivery_threshold',
          value: JSON.stringify(150000),
          group: 'fee',
          description: 'Đơn hàng từ giá trị này sẽ được miễn phí giao hàng (VNĐ)',
        },
      ]);
      console.log('Seeded default system configs!');
    }

    if (restaurantCount > 0) {
      console.log('🌱 Database already seeded. Skipping restaurant/menu seeder.');
      return;
    }

    console.log('🌱 Database is empty. Starting seeder...');

    // 1. Create vendor user if not exists
    let vendor = await User.findOne({ where: { role: 'vendor' } });
    if (!vendor) {
      vendor = await User.create({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Chủ Quán Sài Gòn',
        email: 'vendor@saigon.com',
        password: 'Vendor@123456',
        role: 'vendor',
        status: 'active',
        phone: '0900000004',
      });
      console.log('Created seeder vendor user!');
    }

    // 2. Insert restaurants
    await Restaurant.bulkCreate(
      SEED_RESTAURANTS.map((r) => ({
        id: r.id,
        ownerId: vendor!.id,
        name: r.name,
        address: r.address,
        deliveryFee: r.deliveryFee,
        minOrderValue: 20000,
        status: r.isOpen ? 'open' : 'closed',
        ratingAvg: r.rating,
      }))
    );
    console.log(`Seeded ${SEED_RESTAURANTS.length} restaurants!`);

    // 3. Insert menu items
    await MenuItem.bulkCreate(
      SEED_MENU_ITEMS.map((item) => ({
        id: item.id,
        restaurantId: item.restaurantId,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.imageUrl,
        images: item.images,
        stock: item.stock,
        soldCount: item.soldCount,
        category: item.category,
        viewCount: item.viewCount,
        isAvailable: item.isAvailable,
      }))
    );
    console.log(`Seeded ${SEED_MENU_ITEMS.length} menu items!`);

    // 4. Seed Vouchers
    const voucherCount = await Voucher.count();
    if (voucherCount === 0) {
      console.log('🌱 Seeding sample vouchers...');
      const admin = await User.findOne({ where: { role: 'admin' } });
      const vendor = await User.findOne({ where: { role: 'vendor' } });
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);

      await Voucher.bulkCreate([
        // Platform wide
        {
          code: 'SAIGON90S',
          discountType: 'fixed_amount',
          discountValue: 15000,
          minOrderAmount: 40000,
          startDate: now,
          endDate: nextMonth,
          isActive: true,
          createdBy: admin?.id || null,
          restaurantId: null,
        },
        {
          code: 'FREESHIP',
          discountType: 'percentage',
          discountValue: 100,
          maxDiscountAmount: 15000,
          minOrderAmount: 50000,
          startDate: now,
          endDate: nextMonth,
          isActive: true,
          createdBy: admin?.id || null,
          restaurantId: null,
        },
        {
          code: 'ANRATNGON',
          discountType: 'fixed_amount',
          discountValue: 20000,
          minOrderAmount: 80000,
          startDate: now,
          endDate: nextMonth,
          isActive: true,
          createdBy: admin?.id || null,
          restaurantId: null,
        },
        // Restaurant specific
        {
          code: 'HUTIEU10',
          discountType: 'percentage',
          discountValue: 10,
          maxDiscountAmount: 10000,
          minOrderAmount: 30000,
          startDate: now,
          endDate: nextMonth,
          isActive: true,
          createdBy: vendor?.id || null,
          restaurantId: 'rest-1',
        },
        {
          code: 'COMTAM15',
          discountType: 'fixed_amount',
          discountValue: 15000,
          minOrderAmount: 50000,
          startDate: now,
          endDate: nextMonth,
          isActive: true,
          createdBy: vendor?.id || null,
          restaurantId: 'rest-2',
        },
        {
          code: 'BANHMI5K',
          discountType: 'fixed_amount',
          discountValue: 5000,
          minOrderAmount: 20000,
          startDate: now,
          endDate: nextMonth,
          isActive: true,
          createdBy: vendor?.id || null,
          restaurantId: 'rest-5',
        }
      ]);
      console.log('Seeded sample vouchers!');
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
