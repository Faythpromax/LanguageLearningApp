const mongoose = require('mongoose')

// newCardsPerDay: số từ mới mỗi ngày; dailyExtra: số thẻ "Add more" của riêng 1 ngày (date dạng YYYY-MM-DD giờ VN)
const userSchema = new mongoose.Schema({
    email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:       { type: String, required: true, select: false },
    name:           { type: String },
    role:           { type: String, enum: ['user', 'admin'], default: 'user' },
    newCardsPerDay: { type: Number, default: 3, min: 1, max: 50 },
    dailyExtra:     { date: String, count: { type: Number, default: 0 } }
}, { timestamps: true });

const User = mongoose.model('User', userSchema)

module.exports = User
