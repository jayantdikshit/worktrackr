const express = require('express');
const router = express.Router();
const {
    createTask,
    assignTask,
    updateTaskStatus,
    getMyTasks,
    getAllTasks,
    updateTask,
    deleteTask,
    getProjectTasks,
    getTaskTimeline,
    getTaskById
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Tasks fetch karne ke routes (Role-based filtering controller mein handled hai)
router.get('/', protect, getAllTasks);
router.get('/my', protect, getMyTasks);
router.get('/project/:projectId', protect, getProjectTasks);
router.get('/:id', protect, getTaskById);
router.get('/:id/timeline', protect, getTaskTimeline);

// Admin exclusive routes: Task creation and delegation logic
router.post('/assign', protect, authorizeRoles('ADMIN'), assignTask);
router.post('/create', protect, authorizeRoles('ADMIN'), createTask);
router.patch('/update/:id', protect, authorizeRoles('ADMIN'), updateTask);
router.delete('/:id', protect, authorizeRoles('ADMIN'), deleteTask);

// Status update functionality: Accessible by both Admin and the assigned Member
router.patch('/status/:id', protect, updateTaskStatus);

module.exports = router;