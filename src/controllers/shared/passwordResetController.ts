import { Request, Response } from "express";
import { AppDataSource } from "../../config/data-source";
import { VerificationCode } from "../../entities/VerificationCode";
import { Customer } from "../../entities/Customer";
import { Vendor } from "../../entities/Vendor";
import { Rider } from "../../entities/Rider";
import { Admin } from "../../entities/Admin";
import { SMSService } from "../../services/shared/sms.service";
import { EmailService } from "../../services/shared/email.service";
import bcrypt from "bcrypt";

type UserType = "customer" | "vendor" | "rider" | "admin";

export class PasswordResetController {
  /**
   * POST /api/shared/auth/forgot-password
   * Initiate password reset by sending verification code via email or SMS
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { contact, userType, channel = "email" } = req.body;

      if (!contact || !userType) {
        return res.status(400).json({
          success: false,
          message: "Contact (email/phone) and userType are required",
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
          message:
            "Invalid userType. Must be: customer, vendor, rider, or admin",
        });
      }

      // Find user by contact
      const user = await PasswordResetController.findUserByContact(
        contact,
        userType
      );

      if (!user) {
        // Security: Don't reveal if user exists or not
        return res.status(200).json({
          success: true,
          message:
            "If an account exists with this contact, a verification code has been sent",
        });
      }

      // Send verification code based on channel
      let result;
      if (channel === "sms" && user.phone) {
        const entityRelation = { [userType]: { id: user.id } };
        result = await SMSService.sendOTP(
          user.phone,
          userType,
          entityRelation,
          "password_reset"
        );
      } else if (channel === "email" && user.email) {
        const entityRelation = { [userType]: { id: user.id } };
        result = await EmailService.sendVerificationEmail(
          user.email,
          userType,
          entityRelation,
          "password_reset"
        );
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Invalid channel or contact method not available for this user",
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
        // Include code in development mode only
        ...(process.env.NODE_ENV === "development" &&
          result.code && { code: result.code }),
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process password reset request",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/shared/auth/verify-reset-code
   * Verify the reset code before allowing password change
   */
  static async verifyResetCode(req: Request, res: Response) {
    try {
      const { contact, code, userType } = req.body;

      if (!contact || !code || !userType) {
        return res.status(400).json({
          success: false,
          message: "Contact, code, and userType are required",
        });
      }

      // Find verification code
      const verificationRepo = AppDataSource.getRepository(VerificationCode);

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

      // Check expiration
      if (new Date() > verification.expiresAt) {
        return res.status(400).json({
          success: false,
          message: "Verification code has expired",
        });
      }

      // Check max attempts
      if (verification.attempts >= 3) {
        return res.status(400).json({
          success: false,
          message: "Maximum verification attempts exceeded",
        });
      }

      // Update verification as used
      verification.used = true;
      verification.verified = true;
      await verificationRepo.save(verification);

      return res.status(200).json({
        success: true,
        message: "Verification code is valid",
        verificationId: verification.id,
      });
    } catch (error: any) {
      console.error("Verify reset code error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify reset code",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/shared/auth/reset-password
   * Complete password reset with new password
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { contact, code, newPassword, userType } = req.body;

      if (!contact || !code || !newPassword || !userType) {
        return res.status(400).json({
          success: false,
          message: "Contact, code, newPassword, and userType are required",
        });
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
      }

      // Find and validate verification code
      const verificationRepo = AppDataSource.getRepository(VerificationCode);

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

      // Check if already used for password reset
      if (verification.metadata?.passwordReset) {
        return res.status(400).json({
          success: false,
          message: "This verification code has already been used",
        });
      }

      // Find user
      const user = await PasswordResetController.findUserByContact(
        contact,
        userType
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      const userRepo = PasswordResetController.getUserRepository(userType);
      await userRepo.update({ id: user.id }, { password: hashedPassword });

      // Mark verification as used for password reset
      verification.metadata = { ...verification.metadata, passwordReset: true };
      await verificationRepo.save(verification);

      return res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to reset password",
        error: error.message,
      });
    }
  }

  /**
   * Helper: Find user by contact (email or phone) across user types
   */
  private static async findUserByContact(contact: string, userType: UserType) {
    const repo = PasswordResetController.getUserRepository(userType);

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
