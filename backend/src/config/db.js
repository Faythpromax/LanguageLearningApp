const mongoose = require('mongoose');

// Kết nối tới MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Kết nối tới MongoDB thành công');
    } catch (err) {
        console.error('Kết nối tới MongoDB thất bại:', err.message);
        process.exit(1); // Thoát ứng dụng nếu không kết nối được
    }
}

module.exports = connectDB;