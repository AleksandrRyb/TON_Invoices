import { Router } from 'express';
import * as userController from '@controllers/userController';
import { asyncHandler } from '@utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(userController.getAllUsers));
router.get('/:id', asyncHandler(userController.getUserById));
router.post('/', asyncHandler(userController.createUser));
router.delete('/:id', asyncHandler(userController.deleteUser));

export default router; 