"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        let errorMessage = "Validation error";
        if (firstError.msg) {
            errorMessage = firstError.msg;
        }
        else if (firstError.type === "field") {
            const fieldName = firstError.path || firstError.param;
            errorMessage = `Invalid value for ${fieldName}`;
        }
        return res.status(400).json({
            success: false,
            message: errorMessage,
            errors: errors.array().map((err) => ({
                field: err.type === "field" ? err.path || err.param : err.type,
                message: err.msg,
                location: err.location,
            })),
        });
    }
    next();
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map