const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMyOrders, createOrder } = require('../controllers/orderController');

router.get('/my', authMiddleware, getMyOrders);
router.post('/create', authMiddleware, createOrder);

module.exports = router;
