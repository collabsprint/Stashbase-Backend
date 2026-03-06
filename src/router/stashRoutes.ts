import { Router } from 'express';
import multer from 'multer';
import { stashController } from '../controllers/stashController';
import { authenticate } from '../middlewares/authenticate';
import { validate, createStashSchema, updateStashSchema } from '../middlewares/validate';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

/**
 * Multer for file uploads. Memory storage — buffer is passed directly to Cloudinary.
 * Limits: 500MB (covers most videos; increase if needed or use resumable uploads).
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /^(image\/|video\/|application\/pdf)/;
    if (allowed.test(file.mimetype)) return cb(null, true);
    cb(new Error('Unsupported file type. Allowed: images, videos, PDFs'));
  },
});

router.use(authenticate);

router.get('/', asyncHandler(stashController.getAllStashes));

router.post(
  '/',
  upload.single('file'),
  validate(createStashSchema),
  asyncHandler(stashController.createStash)
);

router.get('/:id', asyncHandler(stashController.getById));
router.patch('/:id', validate(updateStashSchema), asyncHandler(stashController.updateStash));
router.put('/:id/delete', asyncHandler(stashController.deleteStash));

export default router;