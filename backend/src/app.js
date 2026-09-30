// Khởi tạo express - biến app là server express
const express = require('express');
const wordRoutes = require('./routes/wordRoutes')
const app = express();

// Middleware: cho phép Express đọc JSON trong body của request
// Không có dòng này thì req.body sẽ là undefined khi client gửi JSON
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Express server is running')
});

// Gắn /words là mặc định cho router của wordRoutes
app.use('/words', wordRoutes)

//export cho server.js dung
module.exports = app;