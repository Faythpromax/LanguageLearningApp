const express = require('express')
const router = express.Router()
const grammarController = require('../controllers/grammarController')
const { protect, authorize } = require('../middlewares/auth')

router.get('/', protect, grammarController.getAllGrammars)
router.post('/', protect, authorize('admin'), grammarController.createGrammar)
router.put('/:id', protect, authorize('admin'), grammarController.updateGrammar)
router.delete('/:id', protect, authorize('admin'), grammarController.deleteGrammar)

module.exports = router
