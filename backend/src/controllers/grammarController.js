const Grammar = require('../models/Grammar')

// whitelist: chỉ lấy các trường được phép sửa từ body
const pickGrammar = ({ title, structure, usage, examples, notes, level, order }) =>
    ({ title, structure, usage, examples, notes, level, order });

// Danh sách bài ngữ pháp, trả luôn nội dung đầy đủ để app xem dạng thẻ không phải gọi thêm
// shortcut: trả hết 1 lần, ổn với vài chục bài; khi nhiều hơn thì chỉ trả field rút gọn + thêm GET /:id
exports.getAllGrammars = async (req, res) => {
    const grammars = await Grammar.find().sort({ order: 1, _id: 1 });
    res.json(grammars);
}

// Tạo bài ngữ pháp mới
exports.createGrammar = async (req, res) => {
    const newGrammar = await Grammar.create(pickGrammar(req.body));
    res.status(201).json(newGrammar);
}

// Sửa bài ngữ pháp
exports.updateGrammar = async (req, res) => {
    const updated = await Grammar.findByIdAndUpdate(
        req.params.id,
        pickGrammar(req.body),
        { returnDocument: 'after', runValidators: true }
    );
    if (!updated)
        return res.status(404).json({ error: "Khong tim thay bai ngu phap" })
    res.json(updated)
}

// Xóa bài ngữ pháp
exports.deleteGrammar = async (req, res) => {
    const deleted = await Grammar.findByIdAndDelete(req.params.id);
    if (!deleted)
        return res.status(404).json({ error: "Khong tim thay bai ngu phap" })
    res.json({ message: "Xoa thanh cong", grammar: deleted })
}
