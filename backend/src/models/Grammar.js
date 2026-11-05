const mongoose = require('mongoose');

// Bài ngữ pháp (chỉ để xem). Hiện mới dùng để đếm trên dashboard admin.
const grammarSchema = new mongoose.Schema({
    title:     { type: String, required: true },
    structure: String,
    usage:     [String],
    examples:  [{ en: String, vi: String }],
    notes:     String,
    level:     { type: String, enum: ['A1', 'A2', 'B1', 'B2'], default: 'A1' },
    order:     { type: Number, default: 0 }
}, { timestamps: true });

grammarSchema.index({ level: 1, order: 1 });

module.exports = mongoose.model('Grammar', grammarSchema);
