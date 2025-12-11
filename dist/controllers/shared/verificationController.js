"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationController = void 0;
const data_source_1 = require("../../config/data-source");
const VerificationCode_1 = require("../../entities/VerificationCode");
const Customer_1 = require("../../entities/Customer");
const Vendor_1 = require("../../entities/Vendor");
const Rider_1 = require("../../entities/Rider");
const Admin_1 = require("../../entities/Admin");
const sms_service_1 = require("../../services/shared/sms.service");
const email_service_1 = require("../../services/shared/email.service");
class VerificationController {
    static async sendVerificationCode(req, res) {
        try {
            const { contact, userType, channel = "email", purpose = "email_verification", } = req.body;
            if (!contact || !userType) {
                return res.status(400).json({
                    success: false,
                    message: "Contact and userType are required",
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
                    message: "Invalid userType",
                });
            }
            const user = await VerificationController.findUserByContact(contact, userType);
            const entityRelation = user ? { [userType]: { id: user.id } } : undefined;
            let result;
            if (channel === "sms") {
                result = await sms_service_1.SMSService.sendOTP(contact, userType, entityRelation, purpose);
            }
            else if (channel === "email") {
                result = await email_service_1.EmailService.sendVerificationEmail(contact, userType, entityRelation, purpose);
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid channel. Must be "sms" or "email"',
                });
            }
            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to send verification code",
                    error: result.error,
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
            console.error("Send verification code error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to send verification code",
                error: error.message,
            });
        }
    }
    static async verifyCode(req, res) {
        try {
            const { contact, code, userType } = req.body;
            if (!contact || !code || !userType) {
                return res.status(400).json({
                    success: false,
                    message: "Contact, code, and userType are required",
                });
            }
            const result = await sms_service_1.SMSService.verifyOTP(contact, code);
            if (!result.verified) {
                return res.status(400).json({
                    success: false,
                    message: result.error || "Invalid verification code",
                });
            }
            const user = await VerificationController.findUserByContact(contact, userType);
            if (user) {
                const repo = VerificationController.getUserRepository(userType);
                const isEmail = contact.includes("@");
                const updateData = {};
                if (isEmail) {
                    updateData.emailVerified = true;
                }
                else {
                    updateData.phoneVerified = true;
                }
                await repo.update({ id: user.id }, updateData);
            }
            return res.status(200).json({
                success: true,
                message: "Code verified successfully",
                verificationId: result.verificationId,
            });
        }
        catch (error) {
            console.error("Verify code error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to verify code",
                error: error.message,
            });
        }
    }
    static async resendCode(req, res) {
        try {
            const { contact, userType, channel = "email", purpose } = req.body;
            if (!contact || !userType) {
                return res.status(400).json({
                    success: false,
                    message: "Contact and userType are required",
                });
            }
            if (![
                "signup",
                "login",
                "password_reset",
                "phone_verification",
                "email_verification",
                "phone_verification",
            ].includes(purpose)) {
                return res.status(400).json({
                    success: false,
                    message: `purpose should be | "signup"| "login" | "password_reset" | "phone_verification" | "email_verification" | "phone_verification"`,
                });
            }
            const verificationRepo = data_source_1.AppDataSource.getRepository(VerificationCode_1.VerificationCode);
            await verificationRepo.update({ contact, used: false }, { used: true, metadata: { reason: "resend_requested" } });
            const user = await VerificationController.findUserByContact(contact, userType);
            const entityRelation = user ? { [userType]: { id: user.id } } : undefined;
            let result;
            if (channel === "sms") {
                result = await sms_service_1.SMSService.sendOTP(contact, userType, entityRelation, purpose);
            }
            else {
                result = await email_service_1.EmailService.sendVerificationEmail(contact, userType, entityRelation, purpose);
            }
            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to resend verification code",
                    error: result.error,
                });
            }
            return res.status(200).json({
                success: true,
                message: "Verification code resent successfully",
                verificationId: result.verificationId,
                ...(process.env.NODE_ENV === "development" &&
                    result.code && { code: result.code }),
            });
        }
        catch (error) {
            console.error("Resend code error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to resend code",
                error: error.message,
            });
        }
    }
    static async findUserByContact(contact, userType) {
        const repo = VerificationController.getUserRepository(userType);
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
exports.VerificationController = VerificationController;
//# sourceMappingURL=verificationController.js.map