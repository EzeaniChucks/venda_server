"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../../middleware/auth");
const cloudinary_1 = __importStar(require("../../config/cloudinary"));
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
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
        }
        else {
            cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."));
        }
    },
});
router.post("/product", auth_1.authenticate, upload.single("image"), async (req, res) => {
    try {
        const userType = req.user.role;
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
        const result = await (0, cloudinary_1.uploadImage)(req.file.buffer, {
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
    }
    catch (error) {
        console.error("Product image upload error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload product image",
        });
    }
});
router.post("/profile", auth_1.authenticate, upload.single("image"), async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.role;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
            });
        }
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: "File size exceeds 5MB limit",
            });
        }
        const timestamp = Date.now();
        const uniqueFilename = `${userId}-${timestamp}`;
        const result = await (0, cloudinary_1.uploadImage)(req.file.buffer, {
            folder: `venda/profiles/${userType}`,
            publicId: uniqueFilename,
            tags: ["profile", userType],
            transformation: {
                width: 500,
                height: 500,
                crop: "fill",
                gravity: "face",
                format: "jpg",
                quality: "auto:good",
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
    }
    catch (error) {
        console.error("Profile image upload error:", error.response);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload profile image",
        });
    }
});
router.post("/products-bulk", auth_1.authenticate, upload.array("images", 10), async (req, res) => {
    try {
        const userType = req.user.role;
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
        const uploadPromises = req.files.map((file) => (0, cloudinary_1.uploadImage)(file.buffer, {
            folder: "venda/products",
            tags: ["product"],
        }));
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
    }
    catch (error) {
        console.error("Bulk product image upload error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload product images",
        });
    }
});
router.delete("/product-image", auth_1.authenticate, async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: "Public ID is required",
            });
        }
        await cloudinary_1.default.uploader.destroy(publicId);
        res.json({
            success: true,
            message: "Image deleted successfully",
        });
    }
    catch (error) {
        console.error("Image deletion error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete image",
        });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map