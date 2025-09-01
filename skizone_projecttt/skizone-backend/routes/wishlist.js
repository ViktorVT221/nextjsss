const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const wishlistController = require('../controllers/wishlistController');

// Отримати список бажань користувача
router.get('/', authMiddleware, wishlistController.getWishlist);

// Додати товар до списку бажань
router.post('/add', authMiddleware, wishlistController.addToWishlist);

// Видалити товар зі списку бажань
router.delete('/remove/:productId', authMiddleware, wishlistController.removeFromWishlist);

// Очистити весь список бажань
router.delete('/clear', authMiddleware, wishlistController.clearWishlist);

module.exports = router;
