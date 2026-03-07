const prisma = require('../config/db');

// Helper to track history of changes for a task
const logActivity = async(taskId, userId, action, details) => {
    try {
        await prisma.activityLog.create({
            data: {
                taskId: parseInt(taskId),
                userId: parseInt(userId),
                action,
                details
            }
        });
    } catch (err) {
        console.error("Logger Error:", err.message);
    }
};

const PRIORITY_ORDER = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };

exports.getAllTasks = async(req, res) => {
    try {
        // Admin sees tasks they created, Members see tasks assigned to them
        const whereClause = req.user.role === 'ADMIN' ? { createdById: req.user.id } : { assignedToId: req.user.id };

        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: {
                project: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Custom sort to ensure HIGH priority tasks appear first on the UI
        tasks.sort((a, b) => (PRIORITY_ORDER[a.priority] || 4) - (PRIORITY_ORDER[b.priority] || 4));
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks", details: error.message });
    }
};

exports.getTaskById = async(req, res) => {
    const { id } = req.params;
    try {
        const task = await prisma.task.findUnique({
            where: { id: parseInt(id) },
            include: {
                project: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, name: true } }
            }
        });
        if (!task) return res.status(404).json({ error: "Task not found." });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch task details", details: error.message });
    }
};

// Re-assigning task to a different user via email
exports.assignTask = async(req, res) => {
    const { taskId, userEmail } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) return res.status(404).json({ message: "User not found with this email." });

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(taskId) },
            data: { assignedToId: user.id },
            include: { assignedTo: { select: { name: true } } }
        });

        await logActivity(
            updatedTask.id,
            req.user.id,
            "TASK_ASSIGNED",
            `Task assigned to ${user.name} (${user.email})`
        );

        res.json({ success: true, message: `Task successfully assigned to ${user.name}`, task: updatedTask });
    } catch (error) {
        res.status(400).json({ error: "Assignment failed", details: error.message });
    }
};

exports.createTask = async(req, res) => {
    const { title, description, projectId, assignedToId, dueDate, priority, status } = req.body;
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Only Admins can create tasks." });
        }
        const task = await prisma.task.create({
            data: {
                title,
                description,
                projectId: parseInt(projectId),
                assignedToId: assignedToId ? parseInt(assignedToId) : null,
                dueDate: dueDate ? new Date(dueDate) : null,
                createdById: req.user.id,
                priority: priority ? priority.toUpperCase() : 'MEDIUM',
                status: status ? status.toUpperCase() : 'TODO'
            }
        });
        await logActivity(task.id, req.user.id, "TASK_CREATED", `Task "${title}" created.`);
        res.status(201).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ error: "Creation failed", details: error.message });
    }
};

exports.updateTask = async(req, res) => {
    const { id } = req.params;
    const { title, description, priority, status, assignedToId, dueDate, projectId } = req.body;
    try {
        const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
        if (!task) return res.status(404).json({ error: "Task not found" });

        const isAdmin = req.user.role === 'ADMIN';
        const isAssigned = task.assignedToId === req.user.id;

        if (!isAdmin && !isAssigned) return res.status(403).json({ error: "Access denied." });

        // Logic: Members can only update Status, Admins can update everything
        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: {
                title: isAdmin ? (title || undefined) : undefined,
                description: isAdmin ? (description || undefined) : undefined,
                priority: isAdmin ? (priority ? priority.toUpperCase() : undefined) : undefined,
                status: status ? status.toUpperCase() : undefined,
                projectId: isAdmin ? (projectId ? parseInt(projectId) : undefined) : undefined,
                assignedToId: isAdmin && assignedToId !== undefined ? (assignedToId ? parseInt(assignedToId) : null) : undefined,
                dueDate: isAdmin ? (dueDate ? new Date(dueDate) : undefined) : undefined
            }
        });

        await logActivity(updatedTask.id, req.user.id, "TASK_UPDATED", `Updated by ${req.user.role}`);
        res.json({ success: true, task: updatedTask });
    } catch (error) {
        res.status(400).json({ error: "Update failed", details: error.message });
    }
};

exports.updateTaskStatus = async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
        if (!task) return res.status(404).json({ error: "Task not found" });

        const isAdminCreator = req.user.role === 'ADMIN' && task.createdById === req.user.id;
        const isAssignedMember = task.assignedToId === req.user.id;

        if (!isAdminCreator && !isAssignedMember) {
            return res.status(403).json({ error: "Unauthorized to update this task status." });
        }

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: { status: status.toUpperCase() }
        });

        await logActivity(updatedTask.id, req.user.id, "STATUS_CHANGED", `Status updated to ${status}`);
        res.json({ success: true, task: updatedTask });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTask = async(req, res) => {
    const { id } = req.params;
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Admin only." });

        // Cascade delete simulation: Clean up activity logs before deleting the task
        await prisma.activityLog.deleteMany({ where: { taskId: parseInt(id) } });
        await prisma.task.delete({ where: { id: parseInt(id) } });

        res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Delete failed", details: error.message });
    }
};

exports.getMyTasks = async(req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { assignedToId: req.user.id },
            include: { project: true }
        });
        tasks.sort((a, b) => (PRIORITY_ORDER[a.priority] || 4) - (PRIORITY_ORDER[b.priority] || 4));
        res.json(tasks);
    } catch (error) { res.status(500).json({ error: "Failed to fetch tasks" }); }
};

exports.getProjectTasks = async(req, res) => {
    const { projectId } = req.params;
    try {
        const tasks = await prisma.task.findMany({
            where: { projectId: parseInt(projectId) },
            include: { assignedTo: true }
        });
        res.json(tasks);
    } catch (error) { res.status(500).json({ error: "Failed to fetch project tasks" }); }
};

exports.getTaskTimeline = async(req, res) => {
    const { id } = req.params;
    try {
        const timeline = await prisma.activityLog.findMany({
            where: { taskId: parseInt(id) },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(timeline);
    } catch (error) { res.status(500).json({ error: "Failed to fetch timeline" }); }
};