import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { config } from './env';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
  secure: true,
});

/**
 * Uploads an image buffer, base64 string, or file path to Cloudinary.
 */
export async function uploadToCloudinary(
  fileInput: Buffer | string,
  folder: string = 'mini-placement-portal/companies'
): Promise<{ secureUrl: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(fileInput)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload returned empty response.'));
          }
          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(fileInput);
    } else if (typeof fileInput === 'string') {
      cloudinary.uploader.upload(
        fileInput,
        {
          folder,
          resource_type: 'image',
        },
        (error: any, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload returned empty response.'));
          }
          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
    } else {
      reject(new Error('Invalid image input format. Expected Buffer or string.'));
    }
  });
}

/**
 * Safely extracts Cloudinary public_id from a secure URL.
 */
export function extractPublicIdFromUrl(imageUrl?: string | null): string | null {
  if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) return null;

  try {
    const parts = imageUrl.split('/upload/');
    if (parts.length < 2) return null;

    // Remaining part: v1234567/mini-placement-portal/companies/xyz.png
    let pathAfterUpload = parts[1];
    // Remove version prefix if present (e.g., v1723456789/)
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');

    // Strip extension (.jpg, .png, etc.)
    const dotIndex = pathAfterUpload.lastIndexOf('.');
    if (dotIndex !== -1) {
      pathAfterUpload = pathAfterUpload.substring(0, dotIndex);
    }

    return pathAfterUpload || null;
  } catch {
    return null;
  }
}

/**
 * Safely attempts to delete an image from Cloudinary by public ID.
 * Does not throw on error.
 */
export async function deleteFromCloudinary(publicIdOrUrl?: string | null): Promise<void> {
  if (!publicIdOrUrl) return;

  const publicId = publicIdOrUrl.startsWith('http')
    ? extractPublicIdFromUrl(publicIdOrUrl)
    : publicIdOrUrl;

  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    // Gracefully handle deletion failures so DB operations are not blocked
    console.warn(`Could not delete Cloudinary image (${publicId}):`, error.message || error);
  }
}

export default cloudinary;
