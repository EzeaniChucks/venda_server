"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSService = void 0;
const axios_1 = __importDefault(require("axios"));
const data_source_1 = require("../../config/data-source");
const VerificationCode_1 = require("../../entities/VerificationCode");
class SMSService {
    static async sendTermiiOTP(phone, participantType, entityRelation, purpose = "phone_verification") {
        try {
            const apiKey = process.env.TERMII_API_KEY;
            const senderId = process.env.TERMII_SENDER_ID || "VENDA";
            if (!apiKey) {
                console.error("TERMII_API_KEY not configured");
                return { success: false, error: "SMS service not configured" };
            }
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const baseUrl = "https://api.ng.termii.com/api/sms/otp/send";
            const payload = {
                api_key: apiKey,
                message_type: "NUMERIC",
                to: phone,
                from: senderId,
                channel: "generic",
                pin_attempts: 3,
                pin_time_to_live: 30,
                pin_length: 6,
                pin_placeholder: "< 123456 >",
                message_text: `Your VENDA verification code is < 123456 >. Valid for 30 minutes.`,
                pin_type: "NUMERIC",
            };
            const response = await axios_1.default.post(baseUrl, payload);
            const verificationRepo = data_source_1.AppDataSource.getRepository(VerificationCode_1.VerificationCode);
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
            const verification = verificationRepo.create({
                code: otpCode,
                contact: phone,
                phone,
                type: "sms",
                purpose,
                participantType,
                ...(entityRelation || {}),
                pinId: response.data?.pin_id,
                expiresAt,
                used: false,
                verified: false,
            });
            await verificationRepo.save(verification);
            return {
                success: response.data?.status === "200",
                code: otpCode,
                pinId: response.data?.pin_id,
                verificationId: verification.id,
                error: null
            };
        }
        catch (error) {
            console.error("Termii SMS error:", error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
            };
        }
    }
    static async sendManualOTP(phone, participantType, entityRelation, purpose = "phone_verification") {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationRepo = data_source_1.AppDataSource.getRepository(VerificationCode_1.VerificationCode);
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        const verification = verificationRepo.create({
            code: otpCode,
            contact: phone,
            phone,
            type: "sms",
            purpose,
            participantType,
            ...(entityRelation || {}),
            expiresAt,
            used: false,
            verified: false,
        });
        await verificationRepo.save(verification);
        console.log(`📱 DEVELOPMENT MODE: OTP for ${phone} is ${otpCode}`);
        return {
            success: true,
            code: otpCode,
            verificationId: verification.id,
            error: null
        };
    }
    static async verifyOTP(contact, code) {
        try {
            const verificationRepo = data_source_1.AppDataSource.getRepository(VerificationCode_1.VerificationCode);
            const verification = await verificationRepo.findOne({
                where: { contact, code, used: false },
                order: { createdAt: "DESC" },
            });
            if (!verification) {
                return { verified: false, error: "Invalid verification code" };
            }
            if (new Date() > verification.expiresAt) {
                return { verified: false, error: "Verification code expired" };
            }
            if (verification.attempts >= 3) {
                return { verified: false, error: "Too many failed attempts" };
            }
            verification.attempts += 1;
            if (verification.code === code) {
                verification.used = true;
                verification.verified = true;
                await verificationRepo.save(verification);
                return {
                    verified: true,
                    verificationId: verification.id,
                };
            }
            else {
                await verificationRepo.save(verification);
                return { verified: false, error: "Invalid code" };
            }
        }
        catch (error) {
            console.error("OTP verification error:", error);
            return { verified: false, error: "Verification failed" };
        }
    }
    static async sendOTP(phone, participantType, entityRelation, purpose = "phone_verification") {
        if (process.env.TERMII_API_KEY) {
            return await this.sendTermiiOTP(phone, participantType, entityRelation, purpose);
        }
        else {
            return await this.sendManualOTP(phone, participantType, entityRelation, purpose);
        }
    }
}
exports.SMSService = SMSService;
//# sourceMappingURL=sms.service.js.map