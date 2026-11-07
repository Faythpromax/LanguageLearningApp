const Word = require('../models/Word')

// Danh sách từ
exports.getAllWords = async (req, res) => {
    const words = await Word.find().sort({ createdAt: 1, _id: 1 }); // cùng thứ tự với lúc học
    res.json(words);
}

// Tìm từ theo Id
exports.getWordById = async (req, res) => {
    const foundWord = await Word.findById(req.params.id);
    if (!foundWord)
        return res.status(404).json({ error: "Khong tim thay tu"})
    res.json(foundWord)
}

// whitelist: chỉ lấy các trường được phép sửa từ body
const pickWord = ({ word, phonetic, partOfSpeech, meaning, example, exampleMeaning, level }) =>
    ({ word, phonetic, partOfSpeech, meaning, example, exampleMeaning, level });

// Tạo từ mới
exports.createWord = async (req, res) => {
    const newWord = await Word.create(pickWord(req.body));
    res.status(201).json(newWord); // 201 = đã tạo thành công
}

// Sửa từ
exports.updateWord = async (req, res) => {
    const updatedWord = await Word.findByIdAndUpdate(
        req.params.id, // Sửa từ nào (id)
        pickWord(req.body), // Sửa cái gì (trường undefined sẽ bị Mongoose bỏ qua)
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

