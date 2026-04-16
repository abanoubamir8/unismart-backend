const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
    let message = err.message || 'An unexpected error occurred';

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            statusCode = 400;
            errorCode = 'UNIQUE_CONSTRAINT_FAILED';
            message = 'A record with this unique value already exists.';
        } else if (err.code === 'P2025') {
            statusCode = 404;
            errorCode = 'RECORD_NOT_FOUND';
            message = 'The requested database record was not found.';
        } else {
            statusCode = 400;
            errorCode = `PRISMA_ERROR_${err.code}`;
            message = 'A database query operation failed.';
        }
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        errorCode: errorCode
    });
};

module.exports = errorHandler;
