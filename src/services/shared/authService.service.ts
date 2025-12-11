import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../config/data-source";
import { Customer, Vendor, Rider, Admin, RiderDocument } from "../../entities";
import { VendorProfile } from "../../entities/VendorProfile";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

type UserRole = "customer" | "vendor" | "rider" | "admin";
type UserEntity = Customer | Vendor | Rider | Admin;

export class AuthService {
  private customerRepository = AppDataSource.getRepository(Customer);
  private vendorRepository = AppDataSource.getRepository(Vendor);
  private riderRepository = AppDataSource.getRepository(Rider);
  private adminRepository = AppDataSource.getRepository(Admin);
  private vendorProfileRepository = AppDataSource.getRepository(VendorProfile);
  private riderDocumentRepository = AppDataSource.getRepository(RiderDocument);

  async register(data: {
    email: string;
    password: string;
    fullName?: string;
    businessName?: string;
    phone?: string;
    role?: UserRole;
    vehicleType?: string;
    vehicleNumber?: string;
  }): Promise<{ user: UserEntity & { role: UserRole }; token: string }> {
    const role = data.role || "customer";

    await this.checkEmailExists(data.email);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    let user: UserEntity & { role: UserRole };

    switch (role) {
      case "customer":
        const customer = this.customerRepository.create({
          email: data.email,
          password: hashedPassword,
          fullName: data.fullName || "Customer",
          phone: data.phone,
        });
        await this.customerRepository.save(customer);
        user = { ...customer, role: "customer" as const };
        break;

      case "vendor":
        const vendor = this.vendorRepository.create({
          email: data.email,
          password: hashedPassword,
          businessName: data.businessName || data.fullName || "Vendor Business",
          phone: data.phone,
        });
        await this.vendorRepository.save(vendor);

        if (data.businessName) {
          const vendorProfile = this.vendorProfileRepository.create({
            vendorId: vendor.id,
            businessName: data.businessName,
          });
          await this.vendorProfileRepository.save(vendorProfile);
        }

        user = { ...vendor, role: "vendor" as const };
        break;

      case "rider":
        const rider = this.riderRepository.create({
          email: data.email,
          password: hashedPassword,
          fullName: data.fullName || "Rider",
          phone: data.phone,
        });
        await this.riderRepository.save(rider);

        // Create initial RiderDocument entry (replaces RiderProfile)
        const riderDocument = this.riderDocumentRepository.create({
          riderId: rider.id,
          vehicleType: data.vehicleType,
          vehicleRegistration: data.vehicleNumber,
          status: "pending",
          totalDeliveries: 0,
          rating: 0,
        });
        await this.riderDocumentRepository.save(riderDocument);

        user = { ...rider, role: "rider" as const };
        break;

      case "admin":
        const admin = this.adminRepository.create({
          email: data.email,
          password: hashedPassword,
          fullName: data.fullName || "Admin",
          phone: data.phone,
        });
        await this.adminRepository.save(admin);
        user = { ...admin, role: "admin" as const };
        break;

      default:
        throw new Error("Invalid role");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { user, token };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserEntity & { role: UserRole }; token: string }> {
    const result = await this.findUserByEmail(email);

    if (!result) {
      throw new Error("Invalid email or password");
    }

    const { user, role } = result;

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated. Please contact support.");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { user: { ...user, role }, token };
  }

  /**
   * Refresh token logic - IMPROVED VERSION
   */
  async refreshToken(
    oldToken: string,
    role: UserRole
  ): Promise<{ user: any; token: string }> {
    try {
      // Verify the old token
      const decoded = jwt.verify(oldToken, JWT_SECRET) as any;

      if (!decoded) {
        throw new Error("Invalid or expired token");
      }

      // Verify the role matches
      if (decoded.role !== role) {
        throw new Error(
          `Invalid token role. Expected ${role}, got ${decoded.role}`
        );
      }

      // Get fresh user data from database
      const user = await this.getById(decoded.id, role);

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      // Generate new token with updated user info
      const newToken = this.generateToken({
        id: user.id,
        email: user.email,
        role: role, // Use role from DB if available
      });

      return {
        user: { ...user, role },
        token: newToken,
      };
    } catch (error) {
      console.error("Refresh token error:", error);

      // Re-throw with appropriate message
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }

      throw error;
    }
  }

  /**
   * Generate a new JWT token for a user - IMPROVED
   */
  generateToken(user: any): string {
    // Validate required fields
    if (!user.id || !user.email || !user.role) {
      throw new Error("Missing required user fields for token generation");
    }

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
  }

  async getById(userId: string, role: UserRole): Promise<UserEntity | null> {
    switch (role) {
      case "customer":
        return await this.customerRepository.findOne({ where: { id: userId } });
      case "vendor":
        return await this.vendorRepository.findOne({ where: { id: userId } });
      case "rider":
        return await this.riderRepository.findOne({ where: { id: userId } });
      case "admin":
        return await this.adminRepository.findOne({ where: { id: userId } });
      default:
        return null;
    }
  }

  async updateProfile(
    userId: string,
    role: UserRole,
    data: {
      fullName?: string;
      businessName?: string;
      phone?: string;
      profileImage?: string;
      // Vendor specific fields
      state?: string;
      city?: string;
      address?: string;
      businessDescription?: string;
      businessAddress?: string;
      businessPhone?: string;
      bankAccountName?: string;
      bankAccountNumber?: string;
      bankName?: string;
      bankCode?: string;
    }
  ): Promise<UserEntity> {
    let user: UserEntity | null = null;

    // console.log(role);
    // console.log(data);

    switch (role) {
      case "customer":
        user = await this.customerRepository.findOne({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        if (data.fullName) (user as Customer).fullName = data.fullName;
        if (data.phone) user.phone = data.phone;
        if (data.profileImage) user.profileImage = data.profileImage;
        await this.customerRepository.save(user as Customer);
        break;

      case "vendor":
        user = await this.vendorRepository.findOne({
          where: { id: userId },
          relations: ["vendorProfile"],
        });

        if (!user) throw new Error("Vendor not found");

        const vendor = user as Vendor;

        if (!vendor.vendorProfile) throw new Error("Vendor Profile not found");

        // Update vendor basic info
        if (data.businessName) vendor.businessName = data.businessName;
        if (data.phone) vendor.phone = data.phone;
        if (data.profileImage)
          vendor.vendorProfile.profileImage = data.profileImage;
        if (data.state) vendor.state = data.state;
        if (data.city) vendor.city = data.city;
        if (data.address) vendor.address = data.address;

        // Save vendor first
        await this.vendorRepository.save(vendor);

        // Handle vendor profile
        if (vendor.vendorProfile) {
          // Update existing vendor profile
          const vendorProfile = vendor.vendorProfile;

          if (data.businessDescription !== undefined) {
            vendorProfile.businessDescription = data.businessDescription;
          }
          if (data.businessAddress !== undefined) {
            vendorProfile.businessAddress = data.businessAddress;
          }
          if (data.businessPhone !== undefined) {
            vendorProfile.businessPhone = data.businessPhone;
          }
          if (data.bankAccountName !== undefined) {
            vendorProfile.bankAccountName = data.bankAccountName;
          }
          if (data.bankAccountNumber !== undefined) {
            vendorProfile.bankAccountNumber = data.bankAccountNumber;
          }
          if (data.bankName !== undefined) {
            vendorProfile.bankName = data.bankName;
          }
          if (data.bankCode !== undefined) {
            vendorProfile.bankCode = data.bankCode;
          }

          await this.vendorProfileRepository.save(vendorProfile);
        } else {
          // Create new vendor profile if it doesn't exist
          const newProfile = this.vendorProfileRepository.create({
            vendorId: userId,
            businessName: data.businessName || vendor.businessName || "",
            businessDescription: data.businessDescription || "",
            businessAddress: data.businessAddress || "",
            businessPhone: data.businessPhone || "",
            bankAccountName: data.bankAccountName || "",
            bankAccountNumber: data.bankAccountNumber || "",
            bankName: data.bankName || "",
            bankCode: data.bankCode || "",
          });

          await this.vendorProfileRepository.save(newProfile);

          // Reload vendor with profile
          user = await this.vendorRepository.findOne({
            where: { id: userId },
            relations: ["vendorProfile"],
          });
        }
        break;

      case "rider":
        user = await this.riderRepository.findOne({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        if (data.fullName) (user as Rider).fullName = data.fullName;
        if (data.phone) user.phone = data.phone;
        if (data.profileImage) user.profileImage = data.profileImage;
        await this.riderRepository.save(user as Rider);
        break;

      case "admin":
        user = await this.adminRepository.findOne({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        if (data.fullName) (user as Admin).fullName = data.fullName;
        if (data.phone) user.phone = data.phone;
        if (data.profileImage) user.profileImage = data.profileImage;
        await this.adminRepository.save(user as Admin);
        break;

      default:
        throw new Error("Invalid role");
    }

    // Make sure we have the updated user with relations
    if (role === "vendor" && user) {
      user = await this.vendorRepository.findOne({
        where: { id: userId },
        relations: ["vendorProfile"],
      });
    }

    return user!;
  }

  private async checkEmailExists(email: string): Promise<void> {
    const [customer, vendor, rider, admin] = await Promise.all([
      this.customerRepository.findOne({ where: { email } }),
      this.vendorRepository.findOne({ where: { email } }),
      this.riderRepository.findOne({ where: { email } }),
      this.adminRepository.findOne({ where: { email } }),
    ]);

    if (customer || vendor || rider || admin) {
      throw new Error("User already exists with this email");
    }
  }

  private async findUserByEmail(
    email: string
  ): Promise<{ user: UserEntity; role: UserRole } | null> {
    const customer = await this.customerRepository.findOne({
      where: { email },
    });
    if (customer) return { user: customer, role: "customer" };

    const vendor = await this.vendorRepository.findOne({ where: { email } });
    if (vendor) return { user: vendor, role: "vendor" };

    const rider = await this.riderRepository.findOne({ where: { email } });
    if (rider) return { user: rider, role: "rider" };

    const admin = await this.adminRepository.findOne({ where: { email } });
    if (admin) return { user: admin, role: "admin" };

    return null;
  }
}

export default new AuthService();
