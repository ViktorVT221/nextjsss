const express = require('express');
const { registerUser, loginUser, getProfile, updateUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getProfile);
router.patch('/update', authMiddleware, updateUser);

module.exports = router;
