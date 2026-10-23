const Word = require('../models/Word')

// Danh sách từ
exports.getAllWords = async (req, res) => {
    const words = await Word.find();
    res.json(words);
}

// Tìm từ theo Id
exports.getWordById = async (req, res) => {
    const foundWord = await Word.findById(req.params.id);
    if (!foundWord)
        return res.status(404).json({ error: "Khong tim thay tu"})
    res.json(foundWord)
}

// Tạo từ mới
exports.createWord = async (req, res) => {
    const { word, meaning, example, level } = req.body; // whitelist: chỉ lấy trường cho phép
    const newWord = await Word.create({ word, meaning, example, level });
    res.status(201).json(newWord); // 201 = đã tạo thành công
}

// Sửa từ
exports.updateWord = async (req, res) => {
    const { word, meaning, example, level } = req.body;
    const updatedWord = await Word.findByIdAndUpdate(
        req.params.id, // Sửa từ nào (id)
        { word, meaning, example, level }, // Sửa cái gì (trường undefined sẽ bị Mongoose bỏ qua)
    { // Sửa thêm (tùy chọn)
        returnDocument: 'after', // Trả về bản ghi sau khi update
        runValidators: true // Bật cờ này để sửa cũng phải tuân schema
    });
    if (!updatedWord) 
        return res.status(404).json({ error: "Khong tim thay tu hoac khong cap nhat duoc"})
    res.json(updatedWord)
}

// Xóa từ
exports.deleteWord = async (req, res) => {
    const deletedWord = await Word.findByIdAndDelete(req.params.id);
    if (!deletedWord)
        return res.status(404).json({ error: "Khong tim thay tu hoac khong xoa duoc"})
    res.json({ message: "Xoa thanh cong", word: deletedWord})
}

