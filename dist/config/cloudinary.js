"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageUrl = exports.deleteImage = exports.uploadFromUrl = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
const uploadImage = async (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: options.folder || "venda",
            public_id: options.publicId,
            tags: options.tags,
            transformation: options.transformation,
            resource_type: options.resourceType || "auto",
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadImage = uploadImage;
const uploadFromUrl = async (url, options = {}) => {
    const result = await cloudinary_1.v2.uploader.upload(url, {
        folder: options.folder || "venda",
        public_id: options.publicId,
        tags: options.tags,
        transformation: options.transformation,
        resource_type: options.resourceType || "auto",
    });
    return result;
};
exports.uploadFromUrl = uploadFromUrl;
const deleteImage = async (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.destroy(publicId, (error, result) => {
            if (error)
                reject(error);
            else if (result?.result === "ok")
                resolve(result);
            else
                reject(new Error("Delete failed"));
        });
    });
};
exports.deleteImage = deleteImage;
const getImageUrl = (publicId, transformation) => {
    return cloudinary_1.v2.url(publicId, {
        transformation,
        secure: true,
    });
};
exports.getImageUrl = getImageUrl;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map