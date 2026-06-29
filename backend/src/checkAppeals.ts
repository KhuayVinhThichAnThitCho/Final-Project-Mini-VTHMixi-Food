import { sequelize } from './config/database';
import { UnbanAppeal } from './models/UnbanAppeal';
import { User } from './models/User';

async function check() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    const appeals = await UnbanAppeal.findAll({
      include: [{ model: User, as: 'user' }]
    });
    console.log(`Found ${appeals.length} appeals:`);
    console.log(JSON.stringify(appeals, null, 2));
  } catch (err: any) {
    console.error('Error querying appeals:', err);
  } finally {
    await sequelize.close();
  }
}

check();
