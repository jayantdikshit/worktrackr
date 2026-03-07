const prisma = require('../config/db');

// 1. Create a new project
exports.createProject = async(req, res) => {
    const { name, description, status } = req.body;
    try {
        if (!name) return res.status(400).json({ error: "Project name is required" });

        const project = await prisma.project.create({
            data: {
                name: name,
                description: description || "",
                status: status || 'PENDING',
                createdById: req.user.id
            }
        });
        res.status(201).json({ message: "Project created successfully!", project });
    } catch (error) {
        console.error("Create Error:", error);
        res.status(400).json({ error: "Project creation failed", details: error.message });
    }
};

// 2. Update Project (Fixed with Status)
exports.updateProject = async(req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    try {
        const updatedProject = await prisma.project.update({
            where: { id: parseInt(id) },
            data: {
                // undefined ensures only provided fields are updated
                name: name || undefined,
                description: description || undefined,
                status: status || undefined
            }
        });
        res.json({ message: "Project updated successfully", updatedProject });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(400).json({ error: "Update failed", details: error.message });
    }
};

// 3. Delete Project
exports.deleteProject = async(req, res) => {
    const { id } = req.params;
    try {
        await prisma.project.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        // Error usually occurs if project has linked tasks (FK constraint)
        res.status(400).json({ error: "Delete failed. Project might have tasks.", details: error.message });
    }
};

// 4. Invite a member
exports.inviteMember = async(req, res) => {
    const { projectId, userEmail } = req.body;
    try {
        const userToInvite = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!userToInvite) return res.status(404).json({ message: "User not found" });

        const newMember = await prisma.projectMember.create({
            data: {
                projectId: parseInt(projectId),
                userId: userToInvite.id
            }
        });
        res.json({ message: "Member invited successfully", newMember });
    } catch (error) {
        console.error("Invite Error:", error);
        res.status(400).json({ error: "User already in project or invite failed" });
    }
};

// 5. Get all projects
exports.getAllProjects = async(req, res) => {
    try {
        const userId = req.user.id;
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { createdById: userId },
                    { members: { some: { userId: userId } } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { tasks: true, members: true }
                }
            }
        });
        res.json(projects);
    } catch (error) {
        console.error("Get All Projects Error:", error);
        res.status(500).json({ error: "Failed to fetch authorized projects" });
    }
};

// 6. Get Project By ID
exports.getProjectById = async(req, res) => {
    const { id } = req.params;
    try {
        const project = await prisma.project.findUnique({
            where: { id: parseInt(id) }
        });
        if (!project) return res.status(404).json({ error: "Project not found" });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: "Error fetching project details" });
    }
};