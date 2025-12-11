import { Router, Response } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth";
import { AuthRequest } from "../../types";
import cloudinary, { uploadImage } from "../../config/cloudinary";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        )
      );
    }
  },
});

router.post(
  "/product",
  authenticate,
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    try {
      const userType = req.user!.role;

      if (userType !== "vendor") {
        return res.status(403).json({
          success: false,
          message: "Only vendors can upload product images",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const result = await uploadImage(req.file.buffer, {
        folder: "venda/products",
        tags: ["product"],
      });

      res.json({
        success: true,
        message: "Product image uploaded successfully",
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        },
      });
    } catch (error: any) {
      console.error("Product image upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload product image",
      });
    }
  }
);

router.post(
  "/profile",
  authenticate,
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const userType = req.user!.role;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Check file size (React Native sends base64 sometimes)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "File size exceeds 5MB limit",
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const uniqueFilename = `${userId}-${timestamp}`;

      const result = await uploadImage(req.file.buffer, {
        folder: `venda/profiles/${userType}`,
        publicId: uniqueFilename,
        tags: ["profile", userType],
        transformation: {
          width: 500,
          height: 500,
          crop: "fill",
          gravity: "face",
          format: "jpg", // Convert to JPEG for consistency
          quality: "auto:good", // Auto quality
        },
      });

      res.json({
        success: true,
        message: "Profile image uploaded successfully",
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        },
      });
    } catch (error: any) {
      console.error("Profile image upload error:", error.response);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload profile image",
      });
    }
  }
);

router.post(
  "/products-bulk",
  authenticate,
  upload.array("images", 10),
  async (req: AuthRequest, res: Response) => {
    try {
      const userType = req.user!.role;

      if (userType !== "vendor") {
        return res.status(403).json({
          success: false,
          message: "Only vendors can upload product images",
        });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No image files provided",
        });
      }

      const uploadPromises = req.files.map((file) =>
        uploadImage(file.buffer, {
          folder: "venda/products",
          tags: ["product"],
        })
      );

      const results = await Promise.all(uploadPromises);

      res.json({
        success: true,
        message: `${results.length} product images uploaded successfully`,
        data: results.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        })),
      });
    } catch (error: any) {
      console.error("Bulk product image upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload product images",
      });
    }
  }
);

// routes/upload.ts - Add delete endpoint
router.delete(
  "/product-image",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "Public ID is required",
        });
      }

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(publicId);

      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error: any) {
      console.error("Image deletion error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete image",
      });
    }
  }
);
export default router;
