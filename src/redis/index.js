// redis.js
import { Redis } from '@upstash/redis';

// Khởi tạo Redis client
const redis = new Redis({
  url:
    process.env.UPSTASH_REDIS_URL || 'https://exotic-antelope-35385.upstash.io',
  token:
    process.env.UPSTASH_REDIS_TOKEN ||
    'AYo5AAIjcDExNDM0OTljYjFiZTE0ZTYxYWVkNzliYjc1YzBjYzFhZXAxMA',
});

// Kiểm tra kết nối
async function testRedisConnection() {
  try {
    await redis.set('test', 'Redis connection successful', { ex: 10 });
    const result = await redis.get('test');
    console.log('Kết nối tới Redis thành công:', result);
    await redis.del('test');
  } catch (error) {
    console.error('Lỗi khi kết nối tới Redis:', error);
    throw new Error('Không thể kết nối tới Redis');
  }
}

testRedisConnection();

// Export redis instance
export { redis };
