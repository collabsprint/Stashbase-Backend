import { v2 as cloudinarySDK, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { ExternalServiceError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ContentType } from '../types';
import '../config/cloudinary';

type CloudinaryResourceType = 'image' | 'video' | 'raw';

interface UploadResult {
  publicId: string;
  secureUrl: string;
  resourceType: CloudinaryResourceType;
  thumbnailUrl: string;
}

function buildPublicId(userId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${process.env.CLOUDINARY_FOLDER || 'stashbase'}/${userId}/${safe}`;
}

function getResourceType(contentType: ContentType): CloudinaryResourceType {
  if (contentType === ContentType.VIDEO) return 'video';
  if (contentType === ContentType.DOCUMENT) return 'raw';
  return 'image'; 
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  userId: string,
  contentType: ContentType
): Promise<UploadResult> {
  const resourceType = getResourceType(contentType);
  const publicId = buildPublicId(userId, filename);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinarySDK.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        tags: [`user:${userId}`, `type:${contentType}`],
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          return reject(new ExternalServiceError('Cloudinary', error?.message ?? 'Upload failed'));
        }
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });

  logger.debug({ publicId, resourceType }, '[cloudinary] upload complete');

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    resourceType,
    thumbnailUrl: buildThumbnailUrl(result.public_id, contentType),
  };
}


export function buildThumbnailUrl(publicId: string, contentType: ContentType): string {
  switch (contentType) {
    case ContentType.VIDEO:
      return cloudinarySDK.url(publicId, {
        resource_type: 'video',
        transformation: [
          { start_offset: '1', crop: 'fill', width: 400, height: 225, quality: 'auto' },
          { fetch_format: 'jpg' },
        ],
        secure: true,
      });

    case ContentType.DOCUMENT:
      return cloudinarySDK.url(`${publicId}.jpg`, {
        resource_type: 'image',
        transformation: [
          { page: 1 },
          { crop: 'fill', width: 300, height: 400, quality: 'auto' },
        ],
        secure: true,
      });

    case ContentType.PHOTO:
    default:
      return cloudinarySDK.url(publicId, {
        transformation: [
          { crop: 'fill', width: 300, height: 200, quality: 'auto', fetch_format: 'auto' },
        ],
        secure: true,
      });
  }
}

export async function deleteFile(
  publicId: string,
  resourceType: CloudinaryResourceType = 'image'
): Promise<void> {
  try {
    await cloudinarySDK.uploader.destroy(publicId, { resource_type: resourceType });
    logger.debug({ publicId }, '[cloudinary] asset deleted');
  } catch (err) {
    logger.warn({ publicId, err }, '[cloudinary] delete failed — asset may be orphaned');
  }
}