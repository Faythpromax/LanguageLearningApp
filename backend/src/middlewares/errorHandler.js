// Middleware lỗi: phải có đủ 4 tham số (err, req, res, next) thì Express mới nhận ra
// Express 5 tự chuyển lỗi của handler async vào đây, không cần try/catch
module.exports = (err, req, res, next) => {
    if (err.name === 'CastError')
        return res.status(400).json({ error: "Id khong hop le" });

    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ error: "Du lieu khong hop le", details });
    }

    if (err.code === 11000) // trùng giá trị unique (vd: email)
        return res.status(409).json({ error: "Du lieu da ton tai" });

    console.error(err); // chi tiết chỉ log ở server, không gửi cho client
    res.status(500).json({ error: "Loi may chu" });
};
