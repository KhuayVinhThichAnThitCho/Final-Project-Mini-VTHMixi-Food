import { sequelize } from './src/config/database';

async function main() {
  await sequelize.authenticate();
  console.log('Connected!');
  
  // Get current database
  const [dbResult] = await sequelize.query('SELECT DATABASE() as db');
  console.log('Current DB:', dbResult);
  
  // List all databases
  const [dbs] = await sequelize.query('SHOW DATABASES');
  console.log('Databases:', dbs);
  
  // List tables in current database
  const [tables] = await sequelize.query('SHOW TABLES');
  console.log('Tables:', tables);
  
  // Count records in system_configs
  try {
    const [count] = await sequelize.query('SELECT COUNT(*) as count FROM system_configs');
    console.log('System Configs count:', count);
  } catch (err: any) {
    console.log('Error counting configs:', err.message);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
