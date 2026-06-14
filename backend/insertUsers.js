const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'grabfood_mini'
  });

  try {
    const [rows] = await connection.execute("SELECT password FROM users WHERE email = 'vendor_test@saigon.com' LIMIT 1;");
    if (!rows.length) {
      console.log("No base user found to copy password from.");
      return;
    }
    const hashedPassword = rows[0].password;

    console.log('Inserting 5 new users...');
    for (let i = 1; i <= 5; i++) {
      const id = `33333333-3333-3333-3333-33333333330${i}`;
      const email = `khachhang${i}@gmail.com`;
      const name = `Khách Hàng ${i}`;
      
      await connection.execute(`
        INSERT IGNORE INTO users (id, name, email, password, phone, address, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'user', 'active', NOW(), NOW())
      `, [id, name, email, hashedPassword, `090000000${i}`, `Quận ${i}, HCM`]);
    }

    console.log('Done! Created 5 users: khachhang1 to khachhang5');
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();
