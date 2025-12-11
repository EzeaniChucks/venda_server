"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetController = void 0;
const data_source_1 = require("../../config/data-source");
const VerificationCode_1 = require("../../entities/VerificationCode");
const Customer_1 = require("../../entities/Customer");
const Vendor_1 = require("../../entities/Vendor");
const Rider_1 = require("../../entities/Rider");
const Admin_1 = require("../../entities/Admin");
const sms_service_1 = require("../../services/shared/sms.service");
const email_service_1 = require("../../services/shared/email.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
class PasswordResetController {
    static async forgotPassword(req, res) {
        try {
            const { contact, userType, channel = "email" } = req.body;
            if (!contact || !userType) {
                return res.status(400).json({
                    success: false,
                    message: "Contact (email/phone) and userType are required",
                });
            }
            const validUserTypes = [
                "customer",
                "vendor",
                "rider",
                "admin",
            ];
            if (!validUserTypes.includes(userType)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid userType. Must be: customer, vendor, rider, or admin",
                });
            }
            const user = await PasswordResetController.findUserByContact(contact, userType);
            if (!user) {
                return res.status(200).json({
                    success: true,
                    message: "If an account exists with this contact, a verification code has been sent",
                });
            }
            let result;
            if (channel === "sms" && user.phone) {
                const entityRelation = { [userType]: { id: user.id } };
                result = await sms_service_1.SMSService.sendOTP(user.phone, userType, entityRelation, "password_reset");
            }
            else if (channel === "email" && user.email) {
                const entityRelation = { [userType]: { id: user.id } };
                result = await email_service_1.EmailService.sendVerificationEmail(user.email, userType, entityRelation, "password_reset");
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid channel or contact method not available for this user",
                });
            }
            if (!result?.success) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to send verification code",
                    error: result?.error,
                });
            }
            return res.status(200).json({
                success: true,
                message: "Verification code sent successfully",
                verificationId: result.verificationId,
                ...(process.env.NODE_ENV === "development" &&
                    result.code && { code: result.code }),
            });
        }
        catch (error) {
            console.error("Forgot password error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to process password reset request",
                error: error.message,
            });
        }
    }
    static async verifyResetCode(req, res) {
        try {
            const { contact, code, userType } = req.body;
            if (!contact || !code || !userType) {
                return res.status(400).json({
                    success: false,
                    message: "Contact, code, and userType are required",
                });
            }
            const verificationRepo = data_source_1.AppDataSource.getRepository(VerificationCode_1.VerificationCode);
            const verification = await verificationRepo.findOne({
                where: {
                    contact,
                    code,
                    used: false,
                    participantType: userType,
                    purpose: "password_reset",
                },
                order: { createdAt: "DESC" },
            });
            if (!verification) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired verification code",
                });
            }
            if (new Date() > verification.expiresAt) {
                return res.status(400).json({
                    success: false,
                    message: "Verification code has expired",
                });
            }
            if (verification.attempts >= 3) {
                return res.status(400).json({
                    success: false,
                    message: "Maximum verification attempts exceeded",
                });
            }
            verification.used = true;
            verification.verified = true;
            await verificationRepo.save(verification);
            return res.status(200).json({
                success: true,
                message: "Verification code is valid",
                verificationId: verification.id,
            });
        }
        catch (error) {
            console.error("Verify reset code error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to verify reset code",
                error: error.message,
            });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { contact, code, newPassword, userType } = req.body;
            if (!contact || !code || !newPassword || !userType) {
                return res.status(400).json({
                    success: false,
                    message: "Contact, code, newPassword, and userType are required",
                });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 8 characters long",
                });
            }
            const verificationRepo = data_source_1.AppDataSource.getRepository(VerificationCode_1.VerificationCode);
            const verification = await verificationRepo.findOne({
                where: {
                    contact,
                    code,
                    verified: true,
                    participantType: userType,
                    purpose: "password_reset",
                },
                order: { createdAt: "DESC" },
            });
            if (!verification) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or unverified code. Please verify your code first.",
                });
            }
            if (verification.metadata?.passwordReset) {
                return res.status(400).json({
                    success: false,
                    message: "This verification code has already been used",
                });
            }
            const user = await PasswordResetController.findUserByContact(contact, userType);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            const userRepo = PasswordResetController.getUserRepository(userType);
            await userRepo.update({ id: user.id }, { password: hashedPassword });
            verification.metadata = { ...verification.metadata, passwordReset: true };
            await verificationRepo.save(verification);
            return res.status(200).json({
                success: true,
                message: "Password reset successfully",
            });
        }
        catch (error) {
            console.error("Reset password error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to reset password",
                error: error.message,
            });
        }
    }
    static async findUserByContact(contact, userType) {
        const repo = PasswordResetController.getUserRepository(userType);
        let user = await repo.findOne({
            where: { email: contact },
        });
        if (!user) {
            user = await repo.findOne({
                where: { phone: contact },
            });
        }
        return user;
    }
    static getUserRepository(userType) {
        switch (userType) {
            case "customer":
                return data_source_1.AppDataSource.getRepository(Customer_1.Customer);
            case "vendor":
                return data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
            case "rider":
                return data_source_1.AppDataSource.getRepository(Rider_1.Rider);
            case "admin":
                return data_source_1.AppDataSource.getRepository(Admin_1.Admin);
            default:
                throw new Error("Invalid user type");
        }
    }
}
exports.PasswordResetController = PasswordResetController;
//# sourceMappingURL=passwordResetController.js.map