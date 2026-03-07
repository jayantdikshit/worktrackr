const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user humein authMiddleware se milta hai
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role (${req.user.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};

module.exports = { authorizeRoles };