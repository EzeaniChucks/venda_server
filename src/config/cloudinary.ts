import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: any;
  resourceType?: "image" | "video" | "raw" | "auto";
}

export const uploadImage = async (
  fileBuffer: Buffer,
  options: UploadOptions = {}
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "venda",
        public_id: options.publicId,
        tags: options.tags,
        transformation: options.transformation,
        resource_type: options.resourceType || "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const uploadFromUrl = async (
  url: string,
  options: UploadOptions = {}
): Promise<any> => {
  const result = await cloudinary.uploader.upload(url, {
    folder: options.folder || "venda",
    public_id: options.publicId,
    tags: options.tags,
    transformation: options.transformation,
    resource_type: options.resourceType || "auto",
  });

  return result;
};

export const deleteImage = async (publicId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error);
      else if (result?.result === "ok") resolve(result);
      else reject(new Error("Delete failed"));
    });
  });
};

export const getImageUrl = (publicId: string, transformation?: any): string => {
  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
};

export default cloudinary;
