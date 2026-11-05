const express = require('express')
const router = express.Router()
const wordController = require('../controllers/wordController')
const { protect, authorize } = require('../middlewares/auth')

router.get('/', wordController.getAllWords)
router.post('/', protect, authorize('admin'), wordController.createWord)
router.get('/:id', wordController.getWordById)
router.put('/:id', protect, authorize('admin'), wordController.updateWord)
router.delete('/:id', protect, authorize('admin'), wordController.deleteWord)

module.exports = router