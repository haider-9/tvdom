import {
  getCloudinaryConfig as getEnvCloudinaryConfig,
  validateImageFile,
} from "../env.js";

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  transformation?: string;
  width?: number;
  height?: number;
  crop?:
    | "fill"
    | "fit"
    | "scale"
    | "crop"
    | "thumb"
    | "limit"
    | "mfit"
    | "mpad";
  quality?: "auto" | number;
  format?: "auto" | "jpg" | "png" | "webp";
}

export class CloudinaryUploader {
  private cloudName: string;
  private uploadPreset: string;
  private apiUrl: string;

  constructor(cloudName: string, uploadPreset: string) {
    this.cloudName = cloudName;
    this.uploadPreset = uploadPreset;
    this.apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  }

  /**
   * Upload an image file to Cloudinary
   */
  async uploadImage(
    file: File,
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid file.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.uploadPreset);

    // Add optional parameters (only allowed ones for unsigned upload)
    if (options.folder) {
      formData.append("folder", options.folder);
    }

    // Note: transformation parameter is not allowed in unsigned uploads
    // Transformations should be applied via URL generation instead

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Upload failed");
      }

      const result: CloudinaryUploadResult = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Upload failed. Please try again.");
    }
  }

  /**
   * Upload avatar image with optimized settings
   */
  async uploadAvatar(file: File): Promise<CloudinaryUploadResult> {
    return this.uploadImage(file, {
      folder: "tvdom/avatars",
    });
  }

  /**
   * Upload banner image with optimized settings
   */
  async uploadBanner(file: File): Promise<CloudinaryUploadResult> {
    return this.uploadImage(file, {
      folder: "tvdom/banners",
    });
  }

  /**
   * Generate a transformed image URL
   */
  generateUrl(publicId: string, options: CloudinaryUploadOptions = {}): string {
    const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    const transformations: string[] = [];

    if (options.width && options.height) {
      transformations.push(`w_${options.width},h_${options.height}`);
    } else if (options.width) {
      transformations.push(`w_${options.width}`);
    } else if (options.height) {
      transformations.push(`h_${options.height}`);
    }

    if (options.crop) {
      transformations.push(`c_${options.crop}`);
    }

    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }

    if (options.format) {
      transformations.push(`f_${options.format}`);
    }

    const transformationString =
      transformations.length > 0 ? `/${transformations.join(",")}` : "";

    return `${baseUrl}${transformationString}/${publicId}`;
  }

  /**
   * Delete an image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    // Note: Deleting images requires authentication with API secret
    // This would typically be done on the server side
    // For now, we'll just log the deletion request
    console.log(`Delete image request for: ${publicId}`);

    // In a real implementation, you would make an authenticated request to:
    // DELETE https://api.cloudinary.com/v1_1/{cloud_name}/image/destroy
    // with proper authentication headers
  }

  /**
   * Validate if the file is a valid image
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    return validTypes.includes(file.type);
  }

  /**
   * Get optimized thumbnail URL
   */
  getThumbnailUrl(publicId: string, size: number = 150): string {
    return this.generateUrl(publicId, {
      width: size,
      height: size,
      crop: "fill",
      quality: "auto",
      format: "auto",
    });
  }

  /**
   * Get responsive image URLs for different screen sizes
   */
  getResponsiveUrls(publicId: string): Record<string, string> {
    return {
      thumbnail: this.getThumbnailUrl(publicId, 150),
      small: this.generateUrl(publicId, {
        width: 300,
        quality: "auto",
        format: "auto",
      }),
      medium: this.generateUrl(publicId, {
        width: 600,
        quality: "auto",
        format: "auto",
      }),
      large: this.generateUrl(publicId, {
        width: 1200,
        quality: "auto",
        format: "auto",
      }),
      original: this.generateUrl(publicId, { quality: "auto", format: "auto" }),
    };
  }
}

// Environment variables helper
export function getCloudinaryConfig() {
  // Use the imported configuration from environment
  return getEnvCloudinaryConfig();
}

// Create singleton instance
let cloudinaryInstance: CloudinaryUploader | null = null;

export function getCloudinaryUploader(): CloudinaryUploader {
  if (!cloudinaryInstance) {
    const config = getCloudinaryConfig();
    cloudinaryInstance = new CloudinaryUploader(
      config.cloudName,
      config.uploadPreset,
    );
  }
  return cloudinaryInstance;
}

// Utility functions for common image operations
export async function uploadUserAvatar(
  file: File,
): Promise<CloudinaryUploadResult> {
  const uploader = getCloudinaryUploader();
  return uploader.uploadAvatar(file);
}

export async function uploadUserBanner(
  file: File,
): Promise<CloudinaryUploadResult> {
  const uploader = getCloudinaryUploader();
  return uploader.uploadBanner(file);
}

export function optimizeImageUrl(
  url: string,
  options: CloudinaryUploadOptions = {},
): string {
  // Extract public_id from Cloudinary URL if it's already a Cloudinary URL
  const cloudinaryUrlPattern =
    /https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/(?:v\d+\/)?(.+)/;
  const match = url.match(cloudinaryUrlPattern);

  if (match) {
    const publicId = match[1];
    const uploader = getCloudinaryUploader();
    return uploader.generateUrl(publicId, options);
  }

  // If not a Cloudinary URL, return as-is
  return url;
}
