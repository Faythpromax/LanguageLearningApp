const mongoose = require('mongoose');

// Định nghĩa 1 từ vựng gồm những trường gì (từ điển chung, không chứa tiến độ học của user)
const wordSchema = new mongoose.Schema({
    word:           { type: String, required: true },
    phonetic:       String,
    partOfSpeech:   String,
    meaning:        { type: String, required: true },
    example:        String,
    exampleMeaning: String,
    level:          { type: String, enum: ['A1', 'A2', 'B1', 'B2'], default: 'A1'}
}, { timestamps: true })

// Lấy từ cũ nhất -> mới nhất; _id phá hòa khi seed nhiều từ cùng thời điểm
wordSchema.index({ createdAt: 1, _id: 1 });

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;
