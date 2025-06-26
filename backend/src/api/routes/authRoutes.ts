import { Router } from 'express';
import * as authController from '@controllers/authController';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

router.post('/challenge', asyncHandler(authController.postChallenge));
router.post('/verify', asyncHandler(authController.postVerify));

export default router; 