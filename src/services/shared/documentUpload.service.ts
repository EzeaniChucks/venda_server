import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
}

export class DocumentUploadService {
  /**
   * Upload document to Cloudinary
   * @param fileBuffer - File buffer or file path
   * @param folder - Folder in Cloudinary (e.g., 'rider_documents/licenses')
   * @param fileName - Custom file name
   */
  static async uploadDocument(
    fileBuffer: Buffer | string,
    folder: string,
    fileName?: string
  ): Promise<UploadResult> {
    try {
      const uploadOptions: any = {
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

      const result = await new Promise<any>((resolve, reject) => {
        if (Buffer.isBuffer(fileBuffer)) {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(fileBuffer);
        } else {
          cloudinary.uploader.upload(fileBuffer, uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        }
      });

      return {
        url: result.url,
        publicId: result.public_id,
        secureUrl: result.secure_url
      };
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Delete document from Cloudinary
   * @param publicId - Cloudinary public ID
   */
  static async deleteDocument(publicId: string): Promise<void> {
    try {
      if (!publicId) return;

      await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
        resource_type: 'image'
      });

      console.log(`Deleted Cloudinary document: ${publicId}`);
    } catch (error: any) {
      console.error('Cloudinary delete error:', error);
      // Don't throw error - deletion failure shouldn't block the update
      console.warn(`Failed to delete Cloudinary document ${publicId}: ${error.message}`);
    }
  }

  /**
   * Replace document - uploads new and deletes old
   * @param oldPublicId - Old document's public ID to delete
   * @param newFileBuffer - New file buffer
   * @param folder - Cloudinary folder
   * @param fileName - Custom file name
   */
  static async replaceDocument(
    oldPublicId: string | undefined,
    newFileBuffer: Buffer | string,
    folder: string,
    fileName?: string
  ): Promise<UploadResult> {
    // Upload new document first
    const uploadResult = await this.uploadDocument(newFileBuffer, folder, fileName);

    // Delete old document if exists
    if (oldPublicId) {
      await this.deleteDocument(oldPublicId);
    }

    return uploadResult;
  }

  /**
   * Upload driver's license
   */
  static async uploadDriversLicense(
    fileBuffer: Buffer | string,
    riderId: string
  ): Promise<UploadResult> {
    return this.uploadDocument(
      fileBuffer,
      'rider_documents/drivers_licenses',
      `license_${riderId}_${Date.now()}`
    );
  }

  /**
   * Upload vehicle photo
   */
  static async uploadVehiclePhoto(
    fileBuffer: Buffer | string,
    riderId: string
  ): Promise<UploadResult> {
    return this.uploadDocument(
      fileBuffer,
      'rider_documents/vehicles',
      `vehicle_${riderId}_${Date.now()}`
    );
  }

  /**
   * Upload national ID
   */
  static async uploadNationalId(
    fileBuffer: Buffer | string,
    riderId: string
  ): Promise<UploadResult> {
    return this.uploadDocument(
      fileBuffer,
      'rider_documents/national_ids',
      `national_id_${riderId}_${Date.now()}`
    );
  }

  /**
   * Delete all rider documents
   */
  static async deleteAllRiderDocuments(
    driversLicenseId?: string,
    vehiclePhotoId?: string,
    nationalIdId?: string
  ): Promise<void> {
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

export default DocumentUploadService;
