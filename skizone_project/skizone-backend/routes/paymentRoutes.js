const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { confirmOrder } = require('../controllers/paymentController');

router.post('/confirm-order', authMiddleware, confirmOrder);

module.exports = router;
