import { Request, Response } from "express";
import { AppDataSource } from "../../config/data-source";
import { VerificationCode } from "../../entities/VerificationCode";
import { Customer } from "../../entities/Customer";
import { Vendor } from "../../entities/Vendor";
import { Rider } from "../../entities/Rider";
import { Admin } from "../../entities/Admin";
import { SMSService } from "../../services/shared/sms.service";
import { EmailService } from "../../services/shared/email.service";

type UserType = "customer" | "vendor" | "rider" | "admin";

export class VerificationController {
  /**
   * POST /api/shared/verification/send-code
   * Send verification code via SMS or Email
   */
  static async sendVerificationCode(req: Request, res: Response) {
    try {
      const {
        contact,
        userType,
        channel = "email",
        purpose = "email_verification",
      } = req.body;

      if (!contact || !userType) {
        return res.status(400).json({
          success: false,
          message: "Contact and userType are required",
        });
      }

      // Validate user type
      const validUserTypes: UserType[] = [
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

      // Find user (optional - can send code even if user doesn't exist yet for signup)
      const user = await VerificationController.findUserByContact(
        contact,
        userType
      );

      const entityRelation = user ? { [userType]: { id: user.id } } : undefined;

      // Send verification code
      let result;
      if (channel === "sms") {
        result = await SMSService.sendOTP(
          contact,
          userType,
          entityRelation,
          purpose
        );
      } else if (channel === "email") {
        result = await EmailService.sendVerificationEmail(
          contact,
          userType,
          entityRelation,
          purpose
        );
      } else {
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
        // Include code in development mode only
        ...(process.env.NODE_ENV === "development" &&
          result.code && { code: result.code }),
      });
    } catch (error: any) {
      console.error("Send verification code error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/shared/verification/verify-code
   * Verify a code sent via SMS or Email
   */
  static async verifyCode(req: Request, res: Response) {
    try {
      const { contact, code, userType } = req.body;

      if (!contact || !code || !userType) {
        return res.status(400).json({
          success: false,
          message: "Contact, code, and userType are required",
        });
      }

      const result = await SMSService.verifyOTP(contact, code);

      if (!result.verified) {
        return res.status(400).json({
          success: false,
          message: result.error || "Invalid verification code",
        });
      }

      // Mark user as verified if they exist
      const user = await VerificationController.findUserByContact(
        contact,
        userType
      );

      if (user) {
        const repo = VerificationController.getUserRepository(userType);

        // Update verification status based on contact type
        const isEmail = contact.includes("@");
        const updateData: any = {};

        if (isEmail) {
          updateData.emailVerified = true;
        } else {
          updateData.phoneVerified = true;
        }

        await repo.update({ id: user.id }, updateData);
      }

      return res.status(200).json({
        success: true,
        message: "Code verified successfully",
        verificationId: result.verificationId,
      });
    } catch (error: any) {
      console.error("Verify code error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify code",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/shared/verification/resend-code
   * Resend verification code
   */
  static async resendCode(req: Request, res: Response) {
    try {
      const { contact, userType, channel = "email", purpose } = req.body;

      if (!contact || !userType) {
        return res.status(400).json({
          success: false,
          message: "Contact and userType are required",
        });
      }

      if (
        ![
          "signup",
          "login",
          "password_reset",
          "phone_verification",
          "email_verification",
          "phone_verification",
        ].includes(purpose)
      ) {
        return res.status(400).json({
          success: false,
          message: `purpose should be | "signup"| "login" | "password_reset" | "phone_verification" | "email_verification" | "phone_verification"`,
        });
      }
      // Mark previous codes as used to prevent reuse
      const verificationRepo = AppDataSource.getRepository(VerificationCode);
      await verificationRepo.update(
        { contact, used: false },
        { used: true, metadata: { reason: "resend_requested" } as any }
      );

      // Send new code
      const user = await VerificationController.findUserByContact(
        contact,
        userType
      );
      const entityRelation = user ? { [userType]: { id: user.id } } : undefined;

      let result;
      if (channel === "sms") {
        result = await SMSService.sendOTP(
          contact,
          userType,
          entityRelation,
          purpose
        );
      } else {
        result = await EmailService.sendVerificationEmail(
          contact,
          userType,
          entityRelation,
          purpose
        );
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
    } catch (error: any) {
      console.error("Resend code error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to resend code",
        error: error.message,
      });
    }
  }

  /**
   * Helper: Find user by contact
   */
  private static async findUserByContact(contact: string, userType: UserType) {
    const repo = VerificationController.getUserRepository(userType);

    // Try email first
    let user = await repo.findOne({
      where: { email: contact },
    });

    // If not found, try phone
    if (!user) {
      user = await repo.findOne({
        where: { phone: contact },
      });
    }

    return user;
  }

  /**
   * Helper: Get repository for user type
   */
  private static getUserRepository(userType: UserType) {
    switch (userType) {
      case "customer":
        return AppDataSource.getRepository(Customer);
      case "vendor":
        return AppDataSource.getRepository(Vendor);
      case "rider":
        return AppDataSource.getRepository(Rider);
      case "admin":
        return AppDataSource.getRepository(Admin);
      default:
        throw new Error("Invalid user type");
    }
  }
}
