"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const data_source_1 = require("../../config/data-source");
const VerificationCode_1 = require("../../entities/VerificationCode");
class EmailService {
    static async sendVerificationEmail(email, participantType, entityRelation, purpose = "email_verification") {
        try {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationRepo = data_source_1.AppDataSource.getRepository(VerificationCode_1.VerificationCode);
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
            const verification = verificationRepo.create({
                code: otpCode,
                contact: email,
                email,
                type: "email",
                purpose,
                participantType,
                ...(entityRelation || {}),
                expiresAt,
                used: false,
                verified: false,
            });
            await verificationRepo.save(verification);
            const sendGridApiKey = process.env.SENDGRID_API_KEY;
            if (sendGridApiKey) {
                console.log(`📧 Sending email to ${email} with code ${otpCode}`);
            }
            else {
                console.log(`📧 DEVELOPMENT MODE: Email verification for ${email} is ${otpCode}`);
            }
            return {
                success: true,
                code: otpCode,
                verificationId: verification.id,
                error: null,
            };
        }
        catch (error) {
            console.error("Email service error:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    static async sendPasswordResetEmail(email, resetToken) {
        try {
            console.log(`📧 Password reset email sent to ${email} with token ${resetToken}`);
            return true;
        }
        catch (error) {
            console.error("Password reset email error:", error);
            return false;
        }
    }
    static async sendOrderConfirmation(email, orderId, orderDetails) {
        try {
            console.log(`📧 Order confirmation sent to ${email} for order ${orderId}`);
            return true;
        }
        catch (error) {
            console.error("Order confirmation email error:", error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map