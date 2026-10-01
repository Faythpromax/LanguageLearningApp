const jwt = require('jsonwebtoken');

// Kiểm tra đăng nhập
exports.protect = (req, res, next) => {
    const header = req.headers.authorization;
    // Quy ước chuỗi token: Bearer <token>
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Chua dang nhap" })
    }

    const token = header.split(' ')[1] // Lấy phần sau chữ Bearer
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded // gán {id, role} vào request
        next() // Hợp lệ -> đi tiếp
    } catch (err) {
        return res.status(401).json({ error: "Token khong hop le hoac da het han"})
    }
}

// Kiểm tra quyền
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(401).json({ error: "Khong co quyen" })
        }
        next()
    }
}

