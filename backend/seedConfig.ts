import { initializeDatabase } from './src/config/database';

async function main() {
  console.log('Running database seeding check...');
  await initializeDatabase();
  console.log('Done database seeding check!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
