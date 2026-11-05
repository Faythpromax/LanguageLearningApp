const User = require('../models/User');

// Thông tin tài khoản đang đăng nhập
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Khong tim thay user" });
    const { name, email, role, newCardsPerDay } = user;
    res.json({ name, email, role, newCardsPerDay });
}

// Đổi cài đặt học (hiện chỉ có số từ mới mỗi ngày, schema giới hạn 1-50)
exports.updateMe = async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { newCardsPerDay: req.body.newCardsPerDay },
        { returnDocument: 'after', runValidators: true }
    );
    if (!user) return res.status(404).json({ error: "Khong tim thay user" });
    const { name, email, role, newCardsPerDay } = user;
    res.json({ name, email, role, newCardsPerDay });
}
