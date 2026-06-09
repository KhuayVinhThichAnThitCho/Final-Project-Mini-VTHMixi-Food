import { sequelize } from './config/database';

async function test() {
  try {
    console.log('Testing connection...');
    await sequelize.authenticate();
    console.log('Authentication success!');
    await sequelize.sync({ alter: true });
    console.log('Sync success!');
  } catch (err: any) {
    console.error('Error occurred:', err);
  }
}

test();
