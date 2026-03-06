import { Router } from 'express';
import { authenticate }  from '../middlewares/authenticate';
import { asyncHandler }  from '../middlewares/asyncHandler';
import * as authController from '../controllers/authController';
import { validate }      from '../middlewares/validate';
import { registerSchema, loginSchema } from '../middlewares/validate';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login',    validate(loginSchema),    asyncHandler(authController.login));

router.post('/logout',   authenticate, asyncHandler(authController.logout));
router.get('/me',        authenticate, asyncHandler(authController.getSignedInUser));
router.get('/users',     authenticate, asyncHandler(authController.getAllUsers));
router.get('/users/:id', authenticate, asyncHandler(authController.getUserById));

export default router;