const requireAdmin = (req, res, next) => {
    if (req.headers['x-user-role'] === 'admin') {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required.",
        errorCode: "FORBIDDEN"
    });
};

module.exports = requireAdmin;
