const express = require('express');
const router = express.Router();
const { register, login, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Route: Dropdown ke liye users ki list 
router.get('/users', protect, getAllUsers);

module.exports = router;