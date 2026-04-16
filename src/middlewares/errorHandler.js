const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'An unexpected error occurred';

    res.status(statusCode).json({
        success: false,
        message: message,
        errorCode: errorCode
    });
};

module.exports = errorHandler;
