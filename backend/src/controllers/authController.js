const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Đăng ký
exports.register = async (req, res) => {
    const { email, password, name } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ error: "Email da ton tai" });
    }

    const hashedPassword = await bcrypt.hash(password, 10) // Mã hóa mật khẩu (10: độ phức tạp mã hóa)
    const newUser = await User.create({ email, password: hashedPassword, name })

    res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name })
}

// Đăng nhập
exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) 
        return res.status(401).json({ error: "Sai email hoac mat khau"})

    const match = await bcrypt.compare(password, user.password);
    if (!match) 
        return res.status(401).json({ error: "Sai email hoac mat khau"})

    const token = jwt.sign( // cấp JWT
        { id: user._id, role: user.role }, // Dữ liệu truyền vào (k truyền mật khẩu)
        process.env.JWT_SECRET, // Ký bằng khóa bí mật
        { expiresIn: '7d' }
    );

    res.json({ token });
};