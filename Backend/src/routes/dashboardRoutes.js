const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

// GET /api/dashboard/analytics
router.get('/analytics', protect, getAnalytics);

module.exports = router;