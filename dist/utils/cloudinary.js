"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCloudinaryUrl = exports.extractPublicId = void 0;
const extractPublicId = (url) => {
    if (!url || typeof url !== "string") {
        return null;
    }
    try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split("/");
        const uploadIndex = pathParts.indexOf("upload");
        if (uploadIndex === -1 || uploadIndex >= pathParts.length - 1) {
            return null;
        }
        const publicIdWithVersion = pathParts.slice(uploadIndex + 1).join("/");
        const lastDotIndex = publicIdWithVersion.lastIndexOf(".");
        const publicId = lastDotIndex !== -1
            ? publicIdWithVersion.substring(0, lastDotIndex)
            : publicIdWithVersion;
        if (publicId.startsWith("v")) {
            const slashIndex = publicId.indexOf("/");
            if (slashIndex !== -1) {
                return publicId.substring(slashIndex + 1);
            }
        }
        return publicId;
    }
    catch (error) {
        console.error("Error extracting public ID:", error);
        return null;
    }
};
exports.extractPublicId = extractPublicId;
const isCloudinaryUrl = (url) => {
    if (!url)
        return false;
    return url.includes("res.cloudinary.com") && url.includes("/image/upload/");
};
exports.isCloudinaryUrl = isCloudinaryUrl;
//# sourceMappingURL=cloudinary.js.map