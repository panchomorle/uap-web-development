import { Router } from 'express';
import { getMessage, signIn } from '../controllers/authController.js';

const router = Router();

// POST /auth/message - Get SIWE message to sign
router.post('/message', getMessage);

// POST /auth/signin - Verify signature and get JWT token
router.post('/signin', signIn);

export default router;
