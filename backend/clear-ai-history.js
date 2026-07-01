/**
 * Script: Xóa toàn bộ lịch sử AI chat của vendor (MySQL)
 */
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('grabfood_mini', 'root', '123456', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: false,
});

async function clearAiHistory() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối MySQL thành công.');

    // Xóa toàn bộ tin nhắn AI cũ
    const [, meta1] = await sequelize.query('DELETE FROM ai_messages');
    console.log(`🗑️  Đã xóa ${meta1.affectedRows ?? '?'} tin nhắn AI cũ.`);

    // Reset conversation
    await sequelize.query('UPDATE ai_conversations SET last_message_at = NULL, business_memory = NULL');
    console.log('🔄  Đã reset ai_conversations.');

    console.log('\n✨ Xong! Reload lại trang vendor để thấy chat trống.');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await sequelize.close();
  }
}

clearAiHistory();
