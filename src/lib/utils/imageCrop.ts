export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Calculate the crop area to create a square from the center of an image
 */
export function calculateCenterSquareCrop(dimensions: ImageDimensions): CropArea {
  const { width, height } = dimensions;
  const size = Math.min(width, height);
  const x = (width - size) / 2;
  const y = (height - size) / 2;

  return {
    x,
    y,
    width: size,
    height: size
  };
}

/**
 * Calculate the crop area for a banner (16:9 aspect ratio)
 */
export function calculateBannerCrop(dimensions: ImageDimensions): CropArea {
  const { width, height } = dimensions;
  const targetAspectRatio = 16 / 9;
  const currentAspectRatio = width / height;

  let cropWidth: number;
  let cropHeight: number;
  let x = 0;
  let y = 0;

  if (currentAspectRatio > targetAspectRatio) {
    // Image is wider than target, crop width
    cropHeight = height;
    cropWidth = height * targetAspectRatio;
    x = (width - cropWidth) / 2;
  } else {
    // Image is taller than target, crop height
    cropWidth = width;
    cropHeight = width / targetAspectRatio;
    y = (height - cropHeight) / 2;
  }

  return {
    x,
    y,
    width: cropWidth,
    height: cropHeight
  };
}

/**
 * Create a canvas element and crop the image
 */
export function cropImageToCanvas(
  image: HTMLImageElement,
  cropArea: CropArea,
  outputSize?: { width: number; height: number }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to get canvas 2D context');
  }

  // Set output size (default to crop area size)
  const outputWidth = outputSize?.width || cropArea.width;
  const outputHeight = outputSize?.height || cropArea.height;

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Draw the cropped image
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return canvas;
}

/**
 * Convert canvas to blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/jpeg',
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * Load image from file
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Process avatar image: crop to square and resize
 */
export async function processAvatarImage(
  file: File,
  size: number = 300
): Promise<Blob> {
  const image = await loadImageFromFile(file);
  const dimensions = { width: image.width, height: image.height };
  const cropArea = calculateCenterSquareCrop(dimensions);
  const canvas = cropImageToCanvas(cropArea, { width: size, height: size });

  return canvasToBlob(canvas, 'image/jpeg', 0.9);
}

/**
 * Process banner image: crop to 16:9 and resize
 */
export async function processBannerImage(
  file: File,
  width: number = 1200,
  height: number = 400
): Promise<Blob> {
  const image = await loadImageFromFile(file);
  const dimensions = { width: image.width, height: image.height };
  const cropArea = calculateBannerCrop(dimensions);
  const canvas = cropImageToCanvas(cropArea, { width, height });

  return canvasToBlob(canvas, 'image/jpeg', 0.9);
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  const image = await loadImageFromFile(file);
  return {
    width: image.width,
    height: image.height
  };
}

/**
 * Validate if image meets minimum size requirements
 */
export async function validateImageSize(
  file: File,
  minWidth: number = 200,
  minHeight: number = 200
): Promise<{ valid: boolean; error?: string; dimensions?: ImageDimensions }> {
  try {
    const dimensions = await getImageDimensions(file);

    if (dimensions.width < minWidth || dimensions.height < minHeight) {
      return {
        valid: false,
        error: `Image must be at least ${minWidth}x${minHeight} pixels. Current size: ${dimensions.width}x${dimensions.height}`,
        dimensions
      };
    }

    return { valid: true, dimensions };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to read image dimensions'
    };
  }
}

/**
 * Create a preview URL for cropped image
 */
export async function createCroppedPreview(
  file: File,
  cropArea: CropArea,
  maxSize: number = 200
): Promise<string> {
  const image = await loadImageFromFile(file);
  const canvas = cropImageToCanvas(cropArea, { width: maxSize, height: maxSize });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        resolve('');
      }
    });
  });
}

/**
 * Resize image while maintaining aspect ratio
 */
export function calculateResizeToFit(
  original: ImageDimensions,
  target: ImageDimensions
): ImageDimensions {
  const aspectRatio = original.width / original.height;
  const targetAspectRatio = target.width / target.height;

  let newWidth: number;
  let newHeight: number;

  if (aspectRatio > targetAspectRatio) {
    // Original is wider, fit by width
    newWidth = target.width;
    newHeight = target.width / aspectRatio;
  } else {
    // Original is taller, fit by height
    newHeight = target.height;
    newWidth = target.height * aspectRatio;
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  };
}

/**
 * Generate multiple sizes of an image for responsive loading
 */
export async function generateImageSizes(
  file: File,
  sizes: number[] = [150, 300, 600, 1200]
): Promise<{ size: number; blob: Blob; url: string }[]> {
  const image = await loadImageFromFile(file);
  const results = [];

  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    // Calculate dimensions to maintain aspect ratio
    const aspectRatio = image.width / image.height;
    let newWidth = size;
    let newHeight = size / aspectRatio;

    if (newHeight > size) {
      newHeight = size;
      newWidth = size * aspectRatio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.drawImage(image, 0, 0, newWidth, newHeight);

    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);

    results.push({ size, blob, url });
  }

  return results;
}
