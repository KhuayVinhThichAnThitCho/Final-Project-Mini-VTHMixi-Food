import { initializeDatabase } from './config/database';
import { aiCustomerService } from './services/aiCustomerService';

async function test() {
  try {
    console.log('🔌 Connecting to database...');
    await initializeDatabase();

    const userId = '00000000-0000-0000-0000-000000000003'; // default Nguyễn Văn User
    const question = 'Lên kế hoạch cho tôi, tôi là một người miền trung có khẩu vị khá mặn và cay';

    console.log(`🤖 Calling aiCustomerService.askAssistant for user ${userId} with question: "${question}"`);
    const result = await aiCustomerService.askAssistant(userId, question);
    console.log('✅ Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error during aiCustomerService.askAssistant:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

test();
