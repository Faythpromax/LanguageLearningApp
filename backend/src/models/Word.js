const mongoose = require('mongoose');

// Định nghĩa 1 từ vựng gồm những trường gì
const wordSchema = new mongoose.Schema({
    word:       { type: String, required: true },
    meaning:    { type: String, required: true },
    example:    String,
    level:      { type: String, enum: ['A1', 'A2', 'B1', 'B2'], default: 'A1'}
}, { timestampts: true })

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;