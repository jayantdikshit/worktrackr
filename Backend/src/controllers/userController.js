const prisma = require('../config/db');

// Sabhi users ko fetch karne ke liye (Dropdowns ke liye)
exports.getAllUsers = async(req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,

            },
            orderBy: {
                name: 'asc'
            }
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Fetch Users Error:", error);
        res.status(500).json({
            message: "Internal Server Error while fetching users",
            error: error.message
        });
    }
};


exports.getUserProfile = async(req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile" });
    }
};