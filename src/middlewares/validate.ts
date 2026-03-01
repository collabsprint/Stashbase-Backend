import { Request, Response, NextFunction } from 'express';
import { file, z, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return next(new ValidationError(message));
    }
    req.body = result.data;
    next();
  };
}

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(256, 'Name must be under 256 characters'),
  description: z.string().max(1000).optional(),
});

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(256).optional(),
  description: z.string().max(1000).optional(),
}).refine((d) => d.name !== undefined || d.description !== undefined, {
  message: 'At least one field must be provided',
});

const TAG_VALUES = ['Note', 'Website', 'Video', 'Photo', 'Document'] as const;
const CONTENT_TYPES = ['link', 'note', 'photo', 'video', 'document'] as const;

export const createStashSchema = z.object({
  url: z.string().url('Must be a valid URL').optional(),
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().max(500000).optional(),
  collectionId: z.string().uuid(),
  tagName: z.enum(TAG_VALUES),
});

export const updateStashSchema = z.object({
  url: z.string().url('Must be a valid URL').optional(),
  title: z.string().min(1).max(500).optional(),
  content:      z.string().max(500000).nullable().optional(),
  collectionId: z.string().uuid().nullable().optional(),
  tagName: z.enum(TAG_VALUES).nullable().optional(),
}).refine((d) => Object.values(d).some((v) => v !== undefined), {
  message: 'At least one field must be provided',
});

export const searchQuerySchema = z.object({
  q: z.string().max(200).optional(),
  type: z.enum(CONTENT_TYPES).optional(),
  tagName: z.enum(TAG_VALUES).optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});