const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { protect } = require('../middlewares/authMiddleware');

// GET /api/users - Sabhi users ko dropdown ke liye lana
router.get('/', protect, async(req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, role: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Users fetch fail" });
    }
});

module.exports = router;