const Redis = require('ioredis');

// Tạo và cấu hình Redis client
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  db: 0
});

// Xử lý sự kiện kết nối
redis.on('connect', () => {
  console.log('Kết nối đến Redis thành công!');
});

// Xử lý lỗi
redis.on('error', (err) => {
  console.error('Lỗi kết nối Redis:', err);
});

// Export Redis client để sử dụng ở file khác
module.exports = redis;