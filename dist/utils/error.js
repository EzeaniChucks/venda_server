"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true, errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        Object.setPrototypeOf(this, AppError.prototype);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
    static badRequest(message = 'Bad Request', errors) {
        return new AppError(message, 400, true, errors);
    }
    static unauthorized(message = 'Unauthorized') {
        return new AppError(message, 401);
    }
    static forbidden(message = 'Forbidden') {
        return new AppError(message, 403);
    }
    static notFound(message = 'Resource not found') {
        return new AppError(message, 404);
    }
    static conflict(message = 'Conflict') {
        return new AppError(message, 409);
    }
    static validationFailed(errors) {
        return new AppError('Validation failed', 400, true, errors);
    }
    static internalServerError(message = 'Internal server error') {
        return new AppError(message, 500);
    }
    static serviceUnavailable(message = 'Service temporarily unavailable') {
        return new AppError(message, 503);
    }
    toJSON() {
        return {
            success: false,
            message: this.message,
            statusCode: this.statusCode,
            errors: this.errors,
            ...(process.env.NODE_ENV === 'development' && {
                stack: this.stack,
                isOperational: this.isOperational,
            }),
        };
    }
}
exports.AppError = AppError;
//# sourceMappingURL=error.js.map