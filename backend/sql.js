const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'grabfood_mini'
  });

  try {
    console.log('Inserting new vendor...');
    await connection.execute(`
      INSERT IGNORE INTO users (id, name, email, password, phone, address, role, status, created_at, updated_at)
      SELECT '22222222-2222-2222-2222-222222222222', 'Chủ Quán Cơm Tấm', 'vendor2@saigon.com', password, '0901234567', 'Q4, HCM', 'vendor', 'active', NOW(), NOW()
      FROM users WHERE email = 'vendor_test@saigon.com' LIMIT 1;
    `);

    console.log('Updating restaurant owner...');
    await connection.execute(`
      UPDATE restaurants 
      SET owner_id = '22222222-2222-2222-2222-222222222222' 
      WHERE id = 'rest-2';
    `);

    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();
