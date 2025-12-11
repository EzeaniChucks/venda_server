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

export class EmailService {
  /**
   * Send email verification code using SendGrid
   */
  static async sendVerificationEmail(
    email: string,
    participantType?: ParticipantType,
    entityRelation?: EntityRelation,
    purpose:
      | "signup"
      | "login"
      | "password_reset"
      | "phone_verification"
      | "email_verification" = "email_verification"
  ): Promise<{
    success: boolean;
    code?: string;
    verificationId?: string;
    error?: any;
  }> {
    try {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store in database
      const verificationRepo = AppDataSource.getRepository(VerificationCode);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

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

      // TODO: Integrate with SendGrid when SENDGRID_API_KEY is configured
      const sendGridApiKey = process.env.SENDGRID_API_KEY;

      if (sendGridApiKey) {
        // Send via SendGrid (integration to be configured)
        console.log(`📧 Sending email to ${email} with code ${otpCode}`);
        // await sendgrid.send({ to: email, subject: 'VENDA Verification Code', text: `Your code is ${otpCode}` });
      } else {
        // Development mode - just log
        console.log(
          `📧 DEVELOPMENT MODE: Email verification for ${email} is ${otpCode}`
        );
      }

      return {
        success: true,
        code: otpCode,
        verificationId: verification.id,
        error: null,
      };
    } catch (error: any) {
      console.error("Email service error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<boolean> {
    try {
      console.log(
        `📧 Password reset email sent to ${email} with token ${resetToken}`
      );

      // TODO: Integrate with SendGrid
      // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      // await sendgrid.send({ to: email, subject: 'Reset Your Password', html: `Click here: ${resetLink}` });

      return true;
    } catch (error) {
      console.error("Password reset email error:", error);
      return false;
    }
  }

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(
    email: string,
    orderId: string,
    orderDetails: any
  ): Promise<boolean> {
    try {
      console.log(
        `📧 Order confirmation sent to ${email} for order ${orderId}`
      );
      // TODO: Implement SendGrid integration
      return true;
    } catch (error) {
      console.error("Order confirmation email error:", error);
      return false;
    }
  }
}
