const express = require('express')
const router = express.Router()
const Word = require('../models/Word')
const Grammar = require('../models/Grammar')
const { protect, authorize } = require('../middlewares/auth')

// Dashboard tạm: tổng số từ vựng và bài ngữ pháp
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    const [words, grammars] = await Promise.all([Word.countDocuments(), Grammar.countDocuments()])
    res.json({ words, grammars })
})

module.exports = router
