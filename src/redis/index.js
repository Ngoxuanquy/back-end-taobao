const Redis = require('ioredis');

// Tạo và cấu hình Redis client
const redis = new Redis({
  host: 'redis-16421.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
  port: 16421,
  username: 'default', // User (nếu Redis yêu cầu)
  password: 'VkMWvobadobk8NbTAFNp3pT4DguN3Xp5', // Password
  // tls: {} // Thêm nếu Redis yêu cầu TLS (thường cần với Redis Cloud)
});

// Đặt giá trị "foo" = "bar"
redis.set('foo', 'bar', (err) => {
  if (err) {
    console.error('Error setting value:', err);
    return;
  }

  // Lấy giá trị của "foo"
  redis.get('foo', (err, result) => {
    if (err) {
      console.error('Error getting value:', err);
    } else {
      console.log(result); // In ra "bar"
    }

    // Đóng kết nối sau khi hoàn tất
    redis.quit();
  });
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
