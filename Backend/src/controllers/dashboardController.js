const prisma = require('../config/db');

exports.getAnalytics = async(req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const userRole = req.user.role;
        const today = new Date();

        let taskFilter = {};

        // Role check: Admin ko unke projects ke saare tasks dikhane hain, 
        // par Member ko sirf wahi jo unhe assigned hain.
        if (userRole === 'ADMIN') {
            const userProjects = await prisma.project.findMany({
                where: {
                    OR: [
                        { createdById: userId },
                        { members: { some: { userId: userId } } }
                    ]
                },
                select: { id: true }
            });

            const projectIds = userProjects.map(p => p.id);

            // Agar Admin ka koi project nahi mila, toh aage query karne ka fayda nahi.
            if (projectIds.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        totalTasks: 0,
                        completed: 0,
                        pending: 0,
                        assignedToMe: 0,
                        overdue: 0,
                        completionPercentage: 0
                    }
                });
            }
            taskFilter = { projectId: { in: projectIds } };

        } else {
            // Simple filter for regular members
            taskFilter = { assignedToId: userId };
        }

        // Parallel execution: Promise.all use karke saare counts ek saath fetch kar rahe hain 
        // taaki performance optimize rahe aur DB par load kam pade.
        const [
            total,
            todo,
            inProgress,
            completed,
            overdue,
            assignedToMe
        ] = await Promise.all([
            prisma.task.count({ where: taskFilter }),
            prisma.task.count({ where: {...taskFilter, status: 'TODO' } }),
            prisma.task.count({ where: {...taskFilter, status: 'IN_PROGRESS' } }),
            prisma.task.count({ where: {...taskFilter, status: 'COMPLETED' } }),

            // Overdue logic: Task completed nahi hai aur deadline nikal chuki hai
            prisma.task.count({
                where: {
                    ...taskFilter,
                    status: { not: 'COMPLETED' },
                    dueDate: { lt: today, not: null }
                }
            }),

            // Total tasks specifically assigned to the current user
            prisma.task.count({
                where: { assignedToId: userId }
            })
        ]);

        // Pending tasks = TODO + IN_PROGRESS
        const pendingCount = todo + inProgress;

        // Progress percentage calculation (handling divide by zero case)
        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Final JSON response with all dashboard stats
        res.json({
            success: true,
            data: {
                totalTasks: total,
                completed: completed,
                pending: pendingCount,
                assignedToMe: assignedToMe,
                overdue: overdue,
                todo: todo,
                inProgress: inProgress,
                completionPercentage: completionPercentage
            }
        });

    } catch (error) {
        console.error("Dashboard Analytics Error:", error);
        res.status(500).json({
            success: false,
            message: "Data load karne mein issue aa raha hai",
            error: error.message
        });
    }
};