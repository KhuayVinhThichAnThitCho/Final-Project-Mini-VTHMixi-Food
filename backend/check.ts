import { sequelize } from './src/config/database';
import { SystemConfig } from './src/models/SystemConfig';

async function main() {
  await sequelize.authenticate();
  console.log('Connected!');
  const configs = await SystemConfig.findAll();
  console.log('Configs in DB count:', configs.length);
  for (const c of configs) {
    console.log(`Key: ${c.key}, Group: ${c.group}, Value: ${c.value}`);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
