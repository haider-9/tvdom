import { browser } from '$app/environment';
import { dev } from '$app/environment';

// Environment variables for Cloudinary
export const CLOUDINARY_CLOUD_NAME = 'dntncz9no';
export const CLOUDINARY_UPLOAD_PRESET = 'unsigned_preset';

// Validate required environment variables
export function validateEnv() {
  const missing: string[] = [];

  if (!CLOUDINARY_CLOUD_NAME) {
    missing.push('CLOUDINARY_CLOUD_NAME');
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    missing.push('CLOUDINARY_UPLOAD_PRESET');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Get Cloudinary configuration
export function getCloudinaryConfig() {
  validateEnv();

  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  };
}

// App configuration
export const APP_CONFIG = {
  name: 'TVDom',
  version: '1.0.0',
  description: 'Your Ultimate TV & Movie Destination',
  url: browser ? window.location.origin : 'https://tvdom.vercel.app',
  api: {
    tmdb: 'https://api.themoviedb.org/3',
    cloudinary: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`,
  },
  features: {
    cloudinaryUpload: true,
    userProfiles: true,
    ratings: true,
    watchlists: true,
    collections: true,
    socialFeatures: true,
  },
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxBioLength: 500,
    maxReviewLength: 5000,
    maxCollectionItems: 100,
  },
  defaults: {
    theme: 'system' as const,
    language: 'en',
    itemsPerPage: 20,
  },
} as const;

// Development helpers
export const isDev = dev;
export const isProd = !dev;

// Feature flags
export const FEATURES = APP_CONFIG.features;

// API endpoints
export const API_ENDPOINTS = {
  cloudinary: {
    upload: `${APP_CONFIG.api.cloudinary}/image/upload`,
    destroy: `${APP_CONFIG.api.cloudinary}/image/destroy`,
  },
  tmdb: {
    movie: `${APP_CONFIG.api.tmdb}/movie`,
    tv: `${APP_CONFIG.api.tmdb}/tv`,
    search: `${APP_CONFIG.api.tmdb}/search`,
    trending: `${APP_CONFIG.api.tmdb}/trending`,
  },
} as const;

// Validation helpers
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    };
  }

  if (file.size > APP_CONFIG.limits.maxFileSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size is ${APP_CONFIG.limits.maxFileSize / (1024 * 1024)}MB.`,
    };
  }

  return { valid: true };
}

// URL helpers
export function getAssetUrl(path: string): string {
  return `${APP_CONFIG.url}${path.startsWith('/') ? path : `/${path}`}`;
}

// Debug helpers
export function logEnv() {
  if (isDev) {
    console.log('Environment Configuration:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      features: FEATURES,
      limits: APP_CONFIG.limits,
    });
  }
}
