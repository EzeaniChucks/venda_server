"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentUploadService = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
class DocumentUploadService {
    static async uploadDocument(fileBuffer, folder, fileName) {
        try {
            const uploadOptions = {
                folder,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
                transformation: [
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ]
            };
            if (fileName) {
                uploadOptions.public_id = fileName;
            }
            const result = await new Promise((resolve, reject) => {
                if (Buffer.isBuffer(fileBuffer)) {
                    const uploadStream = cloudinary_1.v2.uploader.upload_stream(uploadOptions, (error, result) => {
                        if (error)
                            reject(error);
                        else
                            resolve(result);
                    });
                    uploadStream.end(fileBuffer);
                }
                else {
                    cloudinary_1.v2.uploader.upload(fileBuffer, uploadOptions, (error, result) => {
                        if (error)
                            reject(error);
                        else
                            resolve(result);
                    });
                }
            });
            return {
                url: result.url,
                publicId: result.public_id,
                secureUrl: result.secure_url
            };
        }
        catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error(`Failed to upload document: ${error.message}`);
        }
    }
    static async deleteDocument(publicId) {
        try {
            if (!publicId)
                return;
            await cloudinary_1.v2.uploader.destroy(publicId, {
                invalidate: true,
                resource_type: 'image'
            });
            console.log(`Deleted Cloudinary document: ${publicId}`);
        }
        catch (error) {
            console.error('Cloudinary delete error:', error);
            console.warn(`Failed to delete Cloudinary document ${publicId}: ${error.message}`);
        }
    }
    static async replaceDocument(oldPublicId, newFileBuffer, folder, fileName) {
        const uploadResult = await this.uploadDocument(newFileBuffer, folder, fileName);
        if (oldPublicId) {
            await this.deleteDocument(oldPublicId);
        }
        return uploadResult;
    }
    static async uploadDriversLicense(fileBuffer, riderId) {
        return this.uploadDocument(fileBuffer, 'rider_documents/drivers_licenses', `license_${riderId}_${Date.now()}`);
    }
    static async uploadVehiclePhoto(fileBuffer, riderId) {
        return this.uploadDocument(fileBuffer, 'rider_documents/vehicles', `vehicle_${riderId}_${Date.now()}`);
    }
    static async uploadNationalId(fileBuffer, riderId) {
        return this.uploadDocument(fileBuffer, 'rider_documents/national_ids', `national_id_${riderId}_${Date.now()}`);
    }
    static async deleteAllRiderDocuments(driversLicenseId, vehiclePhotoId, nationalIdId) {
        const deletionPromises = [];
        if (driversLicenseId) {
            deletionPromises.push(this.deleteDocument(driversLicenseId));
        }
        if (vehiclePhotoId) {
            deletionPromises.push(this.deleteDocument(vehiclePhotoId));
        }
        if (nationalIdId) {
            deletionPromises.push(this.deleteDocument(nationalIdId));
        }
        await Promise.allSettled(deletionPromises);
    }
}
exports.DocumentUploadService = DocumentUploadService;
exports.default = DocumentUploadService;
//# sourceMappingURL=documentUpload.service.js.map