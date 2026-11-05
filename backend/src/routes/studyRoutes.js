const express = require('express')
const router = express.Router()
const studyController = require('../controllers/studyController')
const { protect } = require('../middlewares/auth')

router.use(protect)
router.get('/today', studyController.getToday)
router.post('/answer', studyController.answer)
router.post('/extra', studyController.addExtra)

module.exports = router
