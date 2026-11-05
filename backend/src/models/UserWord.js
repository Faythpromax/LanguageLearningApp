const mongoose = require('mongoose');

// Tiến độ học 1 từ của 1 user. Chưa có bản ghi = từ còn ở stack New.
// dueAt <= now = từ nằm trong stack Review.
const userWordSchema = new mongoose.Schema({
    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    word:           { type: mongoose.Schema.Types.ObjectId, ref: 'Word', required: true },
    dueAt:          { type: Date, required: true },
    lastResult:     { type: String, enum: ['again', 'good'] },
    reps:           { type: Number, default: 0 },
    lapses:         { type: Number, default: 0 },
    introducedAt:   { type: Date, required: true },
    lastReviewedAt: Date
});

userWordSchema.index({ user: 1, word: 1 }, { unique: true });
userWordSchema.index({ user: 1, dueAt: 1 });
userWordSchema.index({ user: 1, introducedAt: 1 });

module.exports = mongoose.model('UserWord', userWordSchema);
