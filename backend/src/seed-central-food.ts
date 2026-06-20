import { initializeDatabase } from './config/database';
import { User } from './models/User';
import { Restaurant } from './models/Restaurant';
import { MenuItem } from './models/MenuItem';

async function seedCentralFood() {
  try {
    console.log('🔌 Connecting to database...');
    const connected = await initializeDatabase();
    if (!connected) {
      console.error('❌ Failed to initialize database connection.');
      process.exit(1);
    }

    console.log('🔍 Checking for vendor user...');
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
      console.log('✅ Created default vendor user.');
    }

    console.log('🔍 Checking if Quán Ăn Miền Trung O Nở already exists...');
    let restaurant = await Restaurant.findByPk('rest-central');
    if (!restaurant) {
      restaurant = await Restaurant.create({
        id: 'rest-central',
        ownerId: vendor.id,
        name: 'Quán Ăn Miền Trung O Nở',
        address: '145 Bành Văn Trân, Tân Bình, TP.HCM',
        deliveryFee: 15000,
        minOrderValue: 20000,
        status: 'open',
        ratingAvg: 4.8,
        region: 'Hồ Chí Minh'
      });
      console.log('✅ Created restaurant "Quán Ăn Miền Trung O Nở".');
    } else {
      console.log('ℹ️ Restaurant already exists.');
    }

    const menuItems = [
      {
        id: 'menu-central-1',
        restaurantId: 'rest-central',
        name: 'Bún Bò Huế Đặc Biệt',
        price: 50000,
        description: 'Sợi bún to, thịt bò nạm, chả cua Huế thơm nồng, nước dùng đậm đà, cay xè đặc trưng vị Huế.',
        stock: 50,
        soldCount: 142,
        category: 'pho',
        viewCount: 320,
        isAvailable: true,
      },
      {
        id: 'menu-central-2',
        restaurantId: 'rest-central',
        name: 'Mì Quảng Gà Ta',
        price: 45000,
        description: 'Sợi mì Quảng vàng dai ngon kết hợp thịt gà ta dai ngọt, nước lèo xâm xấp đậm đà ăn kèm bánh đa giòn rụm và rau sống ngon chuẩn vị miền Trung.',
        stock: 40,
        soldCount: 98,
        category: 'pho',
        viewCount: 210,
        isAvailable: true,
      },
      {
        id: 'menu-central-3',
        restaurantId: 'rest-central',
        name: 'Bánh Bèo Chén Miền Trung',
        price: 35000,
        description: 'Mâm bánh bèo chén nhân tôm chấy, mỡ hành beo béo ăn kèm nước mắm ớt tỏi Lý Sơn cay mặn đậm đà.',
        stock: 30,
        soldCount: 180,
        category: 'snack',
        viewCount: 420,
        isAvailable: true,
      },
      {
        id: 'menu-central-4',
        restaurantId: 'rest-central',
        name: 'Bún Lòng Nghệ Xào Hẹ',
        price: 40000,
        description: 'Bún xào lòng heo tươi giòn quyện với bột nghệ vàng tươi, hẹ lá thơm nồng nàn cay ấm bụng đúng vị miền Trung mặn mà.',
        stock: 25,
        soldCount: 65,
        category: 'pho',
        viewCount: 180,
        isAvailable: true,
      }
    ];

    for (const item of menuItems) {
      const existingItem = await MenuItem.findByPk(item.id);
      if (!existingItem) {
        await MenuItem.create(item);
        console.log(`✅ Created menu item: ${item.name}`);
      } else {
        await existingItem.update(item);
        console.log(`✅ Updated menu item: ${item.name}`);
      }
    }

    console.log('🎉 Seeding Central food data completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Central food:', error);
    process.exit(1);
  }
}

seedCentralFood();
