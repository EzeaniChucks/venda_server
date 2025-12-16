/**
 * Extracts the public ID from a Cloudinary URL
 * @param url - The Cloudinary URL (secure_url or url)
 * @returns The public ID or null if not a valid Cloudinary URL
 */
export const extractPublicId = (url: string): string | null => {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    // Cloudinary URL patterns:
    // 1. Standard: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    // 2. With transformations: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
    // 3. With folder: https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{format}

    // Parse the URL
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split("/");

    // Find the index of 'upload' in the path
    const uploadIndex = pathParts.indexOf("upload");

    if (uploadIndex === -1 || uploadIndex >= pathParts.length - 1) {
      return null; // Not a valid Cloudinary upload URL
    }

    // Everything after 'upload/' is the public ID (including version if present)
    const publicIdWithVersion = pathParts.slice(uploadIndex + 1).join("/");

    // Remove file extension
    const lastDotIndex = publicIdWithVersion.lastIndexOf(".");
    const publicId =
      lastDotIndex !== -1
        ? publicIdWithVersion.substring(0, lastDotIndex)
        : publicIdWithVersion;

    // Remove version if present (format: v1234567890/public_id)
    if (publicId.startsWith("v")) {
      const slashIndex = publicId.indexOf("/");
      if (slashIndex !== -1) {
        return publicId.substring(slashIndex + 1);
      }
    }

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

export const isCloudinaryUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes("res.cloudinary.com") && url.includes("/image/upload/");
};
