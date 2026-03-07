const prisma = require('../config/db');

const logActivity = async(taskId, userId, action, details) => {
    try {
        await prisma.activityLog.create({
            data: {
                taskId,
                userId,
                action,
                details
            }
        });
    } catch (error) {
        console.error("Activity Log Error:", error);
    }
};

module.exports = logActivity;