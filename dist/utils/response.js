"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationErrorResponse = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message, statusCode = 500, errors) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};
exports.errorResponse = errorResponse;
const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
    });
};
exports.validationErrorResponse = validationErrorResponse;
//# sourceMappingURL=response.js.map