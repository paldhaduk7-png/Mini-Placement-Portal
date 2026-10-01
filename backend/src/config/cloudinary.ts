import fs from 'fs';
import path from 'path';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { config } from './env';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
  secure: true,
});

/**
 * Uploads a raw file (e.g. PDF resume) to Cloudinary or falls back to local storage.
 */
export async function uploadResumeFile(
  fileBuffer: Buffer,
  originalName: string
): Promise<{ url: string }> {
  // 1. Try Cloudinary raw upload if credentials exist
  if (config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret) {
    try {
      const cleanName = path.parse(originalName).name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const publicId = `${cleanName}_${Date.now()}`;
      const result = await new Promise<{ secureUrl: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'mini-placement-portal/resumes',
            resource_type: 'raw',
            public_id: `${publicId}.pdf`,
          },
          (error, res) => {
            if (error || !res) {
              return reject(error || new Error('Cloudinary upload returned empty response.'));
            }
            resolve({ secureUrl: res.secure_url });
          }
        );
        stream.end(fileBuffer);
      });
      return { url: result.secureUrl };
    } catch (cloudErr: any) {
      console.warn('Cloudinary resume upload failed, saving to local storage fallback:', cloudErr.message || cloudErr);
    }
  }

  // 2. Local storage fallback
  const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const safeFilename = `${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  fs.writeFileSync(path.join(uploadsDir, safeFilename), fileBuffer);
  return { url: `/uploads/resumes/${safeFilename}` };
}

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
