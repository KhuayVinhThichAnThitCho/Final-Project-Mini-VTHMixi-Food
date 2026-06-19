import { initializeDatabase } from './src/config/database';
import { User } from './src/models/User';
import { Restaurant } from './src/models/Restaurant';
import { Order } from './src/models/Order';
import { Review } from './src/models/Review';
import { MenuItem } from './src/models/MenuItem';
const { v4: uuidv4 } = require('uuid');

async function seedAnalytics() {
  console.log('Connecting Database...');
  await initializeDatabase();

  const vendor = await User.findOne({ where: { role: 'vendor', email: 'vendor@saigon.com' } });
  if (!vendor) {
    console.log('Vendor not found');
    process.exit(1);
  }

  const restaurant = await Restaurant.findOne({ where: { ownerId: vendor.id } });
  if (!restaurant) {
    console.log('Vendor has no restaurant');
    process.exit(1);
  }

  const menuItems = await MenuItem.findAll({ where: { restaurantId: restaurant.id } });
  if (menuItems.length === 0) {
    console.log('No menu items found for this restaurant.');
    process.exit(1);
  }

  console.log(`Found restaurant: ${restaurant.name} with ${menuItems.length} items. Generating realistic scenario data...`);

  // Scenario: 
  // - "Hủ Tiếu Mì Sườn Heo Đặc Biệt" sells well but gets complaints about being salty.
  // - "Xí Quách Tô Đặc Biệt" has a surge in sales recently with good reviews.

  const huTieu = menuItems.find(i => i.name.includes('Hủ Tiếu Mì Sườn')) || menuItems[0];
  const xiQuach = menuItems.find(i => i.name.includes('Xí Quách')) || menuItems[1] || menuItems[0];

  const NUM_ORDERS = 60;
  const orders: any[] = [];
  const reviews: any[] = [];

  for (let i = 0; i < NUM_ORDERS; i++) {
    // Phân bổ đơn hàng trong 30 ngày qua
    // Xí Quách bán chạy trong 7 ngày gần đây
    const isRecent = i < 20;
    const randomDaysAgo = isRecent ? Math.floor(Math.random() * 7) : Math.floor(Math.random() * 23) + 7;
    const date = new Date();
    date.setDate(date.getDate() - randomDaysAgo);

    const orderId = uuidv4();
    const isHuTieuOrder = Math.random() > 0.4;

    const items = [];
    let totalItemsPrice = 0;

    if (isHuTieuOrder) {
      items.push({ menuItemId: huTieu.id, name: huTieu.name, quantity: 1, price: huTieu.price });
      totalItemsPrice += Number(huTieu.price);
    }

    // Xí quách order surge in recent days
    if (isRecent || Math.random() > 0.7) {
      items.push({ menuItemId: xiQuach.id, name: xiQuach.name, quantity: 2, price: xiQuach.price });
      totalItemsPrice += Number(xiQuach.price) * 2;
    }

    if (items.length === 0) {
      items.push({ menuItemId: huTieu.id, name: huTieu.name, quantity: 1, price: huTieu.price });
      totalItemsPrice += Number(huTieu.price);
    }

    orders.push({
      id: orderId,
      userId: '00000000-0000-0000-0000-000000000003', // User mẫu
      restaurantId: restaurant.id,
      deliveryAddress: '123 Test Street, Quận 1',
      items: items,
      totalAmount: totalItemsPrice + 15000,
      paymentMethod: 'COD',
      status: 'completed',
      shippingFee: 15000,
      createdAt: date,
      updatedAt: date
    });

    // Generate reviews based on scenario
    if (Math.random() > 0.5) { // 50% orders have reviews
      let rating = 5;
      let comment = 'Ngon tuyệt cú mèo!';

      if (isHuTieuOrder && Math.random() > 0.5) {
        rating = 3;
        const complaints = [
          'Nước dùng hôm nay hơi mặn quá, ăn xong phải uống nhiều nước.',
          'Sườn heo ngon nhưng nước lèo mặn gắt cổ.',
          'Hủ tiếu ngon nhưng bếp nêm muối hơi lố tay.'
        ];
        comment = complaints[Math.floor(Math.random() * complaints.length)];
      } else if (!isHuTieuOrder) {
        rating = 5;
        const praises = [
          'Xí quách to bự, nước dùng ngọt xương chấm sa tế đỉnh.',
          'Món xí quách dạo này hot quá, ăn là ghiền.'
        ];
        comment = praises[Math.floor(Math.random() * praises.length)];
      }

      reviews.push({
        id: uuidv4(),
        orderId: orderId,
        userId: '00000000-0000-0000-0000-000000000003',
        rating,
        comment,
        createdAt: date,
        updatedAt: date
      });
    }
  }

  await Order.bulkCreate(orders);
  console.log(`Created ${orders.length} scenario-based orders.`);

  await Review.bulkCreate(reviews);
  console.log(`Created ${reviews.length} scenario-based reviews.`);

  console.log('Finished seeding analytics data.');
  process.exit(0);
}

seedAnalytics();
