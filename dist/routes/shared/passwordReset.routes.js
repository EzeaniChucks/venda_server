"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passwordResetController_1 = require("../../controllers/shared/passwordResetController");
const router = (0, express_1.Router)();
router.post('/forgot-password', passwordResetController_1.PasswordResetController.forgotPassword);
router.post('/verify-reset-code', passwordResetController_1.PasswordResetController.verifyResetCode);
router.post('/reset-password', passwordResetController_1.PasswordResetController.resetPassword);
exports.default = router;
//# sourceMappingURL=passwordReset.routes.js.map