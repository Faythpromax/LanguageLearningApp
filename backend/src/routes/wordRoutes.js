const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController')

router.get('/', wordController.getAllWords)
router.post('/', wordController.createWord)
router.get('/:id', wordController.getWordById)
router.put('/:id', wordController.updateWord)
router.delete('/:id', wordController.deleteWord)

module.exports = router