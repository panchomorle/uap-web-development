import { Router } from 'express';
import { claimTokens, getFaucetStatus, getFaucetInfo } from '../controllers/faucetController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST /faucet/claim - Claim tokens (protected)
router.post('/claim', authenticateToken, claimTokens);

// GET /faucet/status/:address - Get faucet status for address (protected)
router.get('/status/:address', authenticateToken, getFaucetStatus);

// GET /faucet/info - Get general faucet information (public)
router.get('/info', getFaucetInfo);

export default router;
