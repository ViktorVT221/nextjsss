const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getAllProducts,
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct
} = require('../controllers/productController');

// Отримання товарів (публічно)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Створення товару (лише admin)
router.post('/', authMiddleware, upload.single('image'), createProduct);

// Оновлення товару (лише admin)
router.put('/:id', authMiddleware, upload.single('image'), updateProduct);

// Видалення товару (лише admin)
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
