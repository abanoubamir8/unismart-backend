const requireAdmin = (req, res, next) => {
    if (req.headers['x-user-role'] === 'admin') {
        return next();
    }
    
    // We can also route this to the global error handler 
    // but a direct JSON response is very fast for auth middleware
    return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Admin access required.",
        errorCode: "FORBIDDEN"
    });
};

module.exports = requireAdmin;
