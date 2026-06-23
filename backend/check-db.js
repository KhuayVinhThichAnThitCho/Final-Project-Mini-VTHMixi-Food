const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

require('reflect-metadata');
const { sequelize } = require('./dist/config/database');
const { Order } = require('./dist/models/Order');
const { User } = require('./dist/models/User');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Query shippers
    const shippers = await User.findAll({
      where: { role: 'SHIPPER' }
    });

    console.log('\n--- SHIPPERS IN DB ---');
    shippers.forEach(s => {
      console.log(`Shipper Name: ${s.name}`);
      console.log(`Email: ${s.email}`);
      console.log(`Role: ${s.role}`);
      console.log(`isOnline: ${s.getDataValue('is_online')} / ${s.isOnline}`);
      console.log('------------------------');
    });

    // Query active orders
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: User, as: 'shipper', attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    console.log('\n--- LAST 5 ORDERS ---');
    orders.forEach(o => {
      console.log(`Order ID: ${o.id}`);
      console.log(`Status: ${o.status}`);
      console.log(`Customer: ${o.user?.name} (${o.user?.email})`);
      console.log(`Shipper: ${o.shipper ? `${o.shipper.name} (${o.shipper.email})` : 'None'}`);
      console.log(`Created At: ${o.createdAt}`);
      console.log('------------------------');
    });

  } catch (err) {
    console.error('Error running script:', err);
  } finally {
    await sequelize.close();
  }
}

main();
