import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

export const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Kết nối Redis thành công!');
  } catch (err) {
    console.error('❌ Kết nối Redis thất bại:', err);
  }
};
