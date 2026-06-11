import { initializeDatabase } from './src/config/database';
import { User } from './src/models/User';
import { Restaurant } from './src/models/Restaurant';

async function seedVendor() {
  await initializeDatabase();
  
  let vendor = await User.findOne({ where: { role: 'vendor' } });
  if (!vendor) {
    vendor = await User.create({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Chủ Quán Sài Gòn',
      email: 'vendor@saigon.com',
      password: 'password',
      role: 'vendor',
      status: 'active',
    });
    console.log('Created vendor user!');
  } else {
    console.log('Vendor already exists.');
  }

  // Assign a restaurant to this vendor
  const restaurant = await Restaurant.findOne();
  if (restaurant) {
    await restaurant.update({ ownerId: vendor.id });
    console.log('Assigned restaurant to vendor!');
  }
  
  process.exit(0);
}

seedVendor();
