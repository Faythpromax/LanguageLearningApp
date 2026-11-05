require('dotenv').config();
const mongoose = require('mongoose');
const Word = require('../src/models/Word');
const words = require('./words.json');

// Nhập từ vựng từ words.json: từ đã có (trùng "word") thì cập nhật, chưa có thì thêm mới.
// Chạy tuần tự để createdAt tăng dần đúng thứ tự trong file (thứ tự học cũ -> mới).
async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    let added = 0, updated = 0;
    for (const w of words) {
        const result = await Word.updateOne({ word: w.word }, { $set: w }, { upsert: true, runValidators: true });
        result.upsertedCount ? added++ : updated++;
    }
    console.log(`Them moi ${added} tu, cap nhat ${updated} tu`);
    await mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
