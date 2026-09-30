// import express (Node dùng require thay import)
const express = require('express');
// Khởi tạo express - biến app là server express
const app = express();

// Middleware: cho phép Express đọc JSON trong body của request
// Không có dòng này thì req.body sẽ là undefined khi client gửi JSON
app.use(express.json());

// Dữ liệu cứng
let wordList = [
    { id: 1, word: 'apple', meaning: 'quả táo' },
    { id: 2, word: 'book', meaning: 'quyển sách' }
];

// route GET tới '/'
app.get('/', (req, res) => {
    res.send('Express server is running')
});

// // GET tới '/words'
// app.get('/words', (req, res) => {
//     res.json([
//         {word: 'apple', meaning: 'quả táo' },
//         {word: 'book', meaning: 'quyển sách'}
//     ]);
// });

// READ
app.get('/words', (req, res) => {
    res.json(wordList);
});

// CREATE
app.post('/words', (req, res) => {
    const newWord = {
        id: wordList.length + 1,
        word: req.body.word,
        meaning: req.body.meaning
    };
    wordList.push(newWord);
    res.status(201).json(newWord); // 201 = đã tạo thành công
});

//export cho server.js dung
module.exports = app;