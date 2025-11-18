import { Injectable } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  /**
   * Upload image to Cloudinary
   * @param file - File from multer
   * @param folder - Cloudinary folder path
   * @returns Upload result with URL
   */
  async uploadImage(
    file: any,
    folder: string = 'restaurant-pos/menu-items',
  ): Promise<UploadApiResponse> {
    const cloudinary = await import('cloudinary');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(new Error(error.message));
          resolve(result);
        },
      );

      uploadStream.end((file as Express.Multer.File).buffer);
    });
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Public ID of the image
   * @returns Deletion result
   */
  async deleteImage(publicId: string): Promise<any> {
    const cloudinary = await import('cloudinary');

    try {
      return await cloudinary.v2.uploader.destroy(publicId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete image: ${message}`);
    }
  }

  /**
   * Get optimized image URL
   * @param publicId - Public ID of the image
   * @param width - Desired width
   * @param height - Desired height
   * @returns Optimized image URL
   */
  async getOptimizedUrl(
    publicId: string,
    width?: number,
    height?: number,
  ): Promise<string> {
    const cloudinary = await import('cloudinary');

    return cloudinary.v2.url(publicId, {
      transformation: [
        { width, height, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });
  }
}
