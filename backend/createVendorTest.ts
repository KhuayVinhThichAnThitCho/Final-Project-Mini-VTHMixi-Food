import { Sequelize } from 'sequelize-typescript';
import { User } from './src/models/User';
import { Restaurant } from './src/models/Restaurant';
import bcrypt from 'bcrypt';

const sequelize = new Sequelize('grabfood_mini', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

sequelize.addModels([User, Restaurant]);

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    // Tạo vendor mới
    const hashedPassword = await bcrypt.hash('password', 10);
    const newVendorId = '22222222-2222-2222-2222-222222222222';
    
    let vendor2 = await User.findOne({ where: { email: 'vendor2@saigon.com' } });
    if (!vendor2) {
      vendor2 = await User.create({
        id: newVendorId,
        name: 'Chủ Quán Cơm Tấm',
        email: 'vendor2@saigon.com',
        password: hashedPassword,
        role: 'vendor',
        status: 'active',
      });
      console.log('Tạo thành công tài khoản vendor2@saigon.com');
    } else {
      console.log('Tài khoản vendor2@saigon.com đã tồn tại.');
    }

    // Gán nhà hàng "rest-2" (Cơm Tấm Bãi Rác Quận 4) cho vendor này
    const rest2 = await Restaurant.findByPk('rest-2');
    if (rest2) {
      rest2.ownerId = vendor2.id;
      await rest2.save();
      console.log('Đã cập nhật nhà hàng: Cơm Tấm Bãi Rác Quận 4 thuộc sở hữu của vendor2@saigon.com');
    } else {
      console.log('Không tìm thấy nhà hàng rest-2');
    }

    console.log('HOÀN TẤT!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
