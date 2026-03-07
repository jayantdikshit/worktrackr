const express = require('express');
const router = express.Router();
const {
    createProject,
    inviteMember,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Public/Private access routes
router.get('/', protect, getAllProjects);
router.get('/:id', protect, getProjectById);

// Admin only routes
router.post('/create', protect, authorizeRoles('ADMIN'), createProject);
router.put('/:id', protect, authorizeRoles('ADMIN'), updateProject);
router.delete('/:id', protect, authorizeRoles('ADMIN'), deleteProject);
router.post('/invite', protect, authorizeRoles('ADMIN'), inviteMember);

module.exports = router;