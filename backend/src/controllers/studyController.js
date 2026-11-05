const mongoose = require('mongoose');
const User = require('../models/User');
const Word = require('../models/Word');
const UserWord = require('../models/UserWord');
const { startOfToday, startOfTomorrow, todayKey } = require('../utils/day');

// Danh sách từ mới còn được học hôm nay (stack New), từ cũ nhất -> mới nhất.
// Hạn mức = newCardsPerDay + số thẻ Add more hôm nay − số từ mới đã học hôm nay.
// shortcut: distinct + $nin nạp hết id từ đã học vào RAM, ổn khi mỗi user < vài nghìn từ; lớn hơn thì đổi sang $lookup
async function getNewCards(user) {
    const extra = user.dailyExtra?.date === todayKey() ? user.dailyExtra.count : 0;
    const learnedToday = await UserWord.countDocuments({ user: user._id, introducedAt: { $gte: startOfToday() } });
    const remaining = user.newCardsPerDay + extra - learnedToday;
    if (remaining <= 0) return []; // limit(0) của Mongo = không giới hạn, nên phải chặn trước

    const seen = await UserWord.distinct('word', { user: user._id });
    return Word.find({ _id: { $nin: seen } }).sort({ createdAt: 1, _id: 1 }).limit(remaining);
}

// Hàng đợi hôm nay: stack New + stack Review (các từ đã đến hạn ôn)
exports.getToday = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Khong tim thay user" });

    const newCards = await getNewCards(user);
    const due = await UserWord.find({ user: user._id, dueAt: { $lte: new Date() } })
        .sort({ dueAt: 1 }).populate('word');
    const reviewCards = due.map(d => d.word).filter(Boolean); // bỏ từ đã bị admin xóa

    res.json({ newCards, reviewCards });
}

// Trả lời 1 thẻ: Again -> ôn lại ngay (sau khi hết New), Good -> 00:00 ngày mai
exports.answer = async (req, res) => {
    const { wordId, result } = req.body;
    if (!['again', 'good'].includes(result))
        return res.status(400).json({ error: "result phai la again hoac good" });
    if (!mongoose.isValidObjectId(wordId) || !(await Word.exists({ _id: wordId })))
        return res.status(404).json({ error: "Khong tim thay tu" });

    const now = new Date();
    const userWord = await UserWord.findOneAndUpdate(
        { user: req.user.id, word: wordId },
        {
            $set: { dueAt: result === 'again' ? now : startOfTomorrow(now), lastResult: result, lastReviewedAt: now },
            $inc: { reps: 1, lapses: result === 'again' ? 1 : 0 },
            $setOnInsert: { introducedAt: now }
        },
        { upsert: true, returnDocument: 'after' }
    );
    res.json({ dueAt: userWord.dueAt });
}

// Add more cards: cộng thêm count từ mới cho riêng hôm nay, trả lại toàn bộ stack New còn lại
exports.addExtra = async (req, res) => {
    const count = Number(req.body.count);
    if (!Number.isInteger(count) || count < 1 || count > 50)
        return res.status(400).json({ error: "So luong phai tu 1 den 50" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Khong tim thay user" });

    const today = todayKey();
    const current = user.dailyExtra?.date === today ? user.dailyExtra.count : 0;
    user.dailyExtra = { date: today, count: current + count };
    await user.save();

    res.json({ newCards: await getNewCards(user) });
}
