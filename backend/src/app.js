// Khởi tạo express - biến app là server express
const express = require('express');
const wordRoutes = require('./routes/wordRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const studyRoutes = require('./routes/studyRoutes')
const adminRoutes = require('./routes/adminRoutes')
const app = express();

// Middleware: cho phép Express đọc JSON trong body của request
// Không có dòng này thì req.body sẽ là undefined khi client gửi JSON
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Express server is running')
});

// Gắn /words là mặc định cho router của wordRoutes
app.use('/words', wordRoutes)
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/study', studyRoutes)
app.use('/admin', adminRoutes)

// Phải đặt sau tất cả routes để bắt lỗi từ chúng
app.use(require('./middlewares/errorHandler'))

//export cho server.js dung
module.exports = app;