require('dotenv').config();
const mongoose = require('mongoose');
const Grammar = require('../src/models/Grammar');
const grammars = require('./grammars.json');

// Nhập bài ngữ pháp từ grammars.json: trùng "title" thì cập nhật, chưa có thì thêm mới
async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    let added = 0, updated = 0;
    for (const g of grammars) {
        const result = await Grammar.updateOne({ title: g.title }, { $set: g }, { upsert: true, runValidators: true });
        result.upsertedCount ? added++ : updated++;
    }
    console.log(`Them moi ${added} bai, cap nhat ${updated} bai`);
    await mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
