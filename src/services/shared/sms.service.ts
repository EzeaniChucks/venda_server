import axios from "axios";
import { AppDataSource } from "../../config/data-source";
import {
  VerificationCode,
  ParticipantType,
} from "../../entities/VerificationCode";

type EntityRelation = {
  customer?: { id: string };
  vendor?: { id: string };
  rider?: { id: string };
  admin?: { id: string };
};

export class SMSService {
  /**
   * Send SMS verification code using Termii (Nigerian SMS provider)
   */
  static async sendTermiiOTP(
    phone: string,
    participantType?: ParticipantType,
    entityRelation?: EntityRelation,
    purpose:
      | "signup"
      | "login"
      | "password_reset"
      | "phone_verification"
      | "email_verification" = "phone_verification"
  ): Promise<{
    success: boolean;
    code?: string;
    pinId?: string;
    verificationId?: string;
    error?: any;
  }> {
    try {
      const apiKey = process.env.TERMII_API_KEY;
      const senderId = process.env.TERMII_SENDER_ID || "VENDA";

      if (!apiKey) {
        console.error("TERMII_API_KEY not configured");
        return { success: false, error: "SMS service not configured" };
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      const baseUrl = "https://api.ng.termii.com/api/sms/otp/send";

      const payload = {
        api_key: apiKey,
        message_type: "NUMERIC",
        to: phone,
        from: senderId,
        channel: "generic",
        pin_attempts: 3,
        pin_time_to_live: 30, // 30 minutes
        pin_length: 6,
        pin_placeholder: "< 123456 >",
        message_text: `Your VENDA verification code is < 123456 >. Valid for 30 minutes.`,
        pin_type: "NUMERIC",
      };

      const response = await axios.post(baseUrl, payload);

      // Store verification code in database
      const verificationRepo = AppDataSource.getRepository(VerificationCode);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

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
        error:null
      };
    } catch (error: any) {
      console.error("Termii SMS error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Send SMS using manual generation (fallback or for development)
   */
  static async sendManualOTP(
    phone: string,
    participantType?: ParticipantType,
    entityRelation?: EntityRelation,
    purpose:
      | "signup"
      | "login"
      | "password_reset"
      | "phone_verification"
      | "email_verification" = "phone_verification"
  ): Promise<{
    success: boolean;
    code: string;
    verificationId: string;
    error: null
  }> {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in database
    const verificationRepo = AppDataSource.getRepository(VerificationCode);
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

  /**
   * Verify OTP code
   */
  static async verifyOTP(
    contact: string,
    code: string
  ): Promise<{
    verified: boolean;
    verificationId?: string;
    error?: string;
  }> {
    try {
      const verificationRepo = AppDataSource.getRepository(VerificationCode);

      const verification = await verificationRepo.findOne({
        where: { contact, code, used: false },
        order: { createdAt: "DESC" },
      });

      if (!verification) {
        return { verified: false, error: "Invalid verification code" };
      }

      // Check if expired
      if (new Date() > verification.expiresAt) {
        return { verified: false, error: "Verification code expired" };
      }

      // Check max attempts
      if (verification.attempts >= 3) {
        return { verified: false, error: "Too many failed attempts" };
      }

      // Update attempts
      verification.attempts += 1;

      if (verification.code === code) {
        verification.used = true;
        verification.verified = true;
        await verificationRepo.save(verification);

        return {
          verified: true,
          verificationId: verification.id,
        };
      } else {
        await verificationRepo.save(verification);
        return { verified: false, error: "Invalid code" };
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      return { verified: false, error: "Verification failed" };
    }
  }

  /**
   * Send OTP (auto-selects best method)
   */
  static async sendOTP(
    phone: string,
    participantType?: ParticipantType,
    entityRelation?: EntityRelation,
    purpose:
      | "signup"
      | "login"
      | "password_reset"
      | "phone_verification"
      | "email_verification" = "phone_verification"
  ) {
    // Try Termii first, fallback to manual in development
    if (process.env.TERMII_API_KEY) {
      return await this.sendTermiiOTP(
        phone,
        participantType,
        entityRelation,
        purpose
      );
    } else {
      return await this.sendManualOTP(
        phone,
        participantType,
        entityRelation,
        purpose
      );
    }
  }
}
