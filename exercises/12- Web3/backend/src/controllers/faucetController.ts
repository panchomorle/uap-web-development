import { Request, Response } from 'express';
import {
  claimTokensForAddress,
  checkAddressClaimed,
  getAddressBalance,
  getFaucetUsers,
  getFaucetAmount
} from '../utils/blockchain.js';

export async function claimTokens(req: Request, res: Response) {
  try {
    // User is authenticated via middleware, address is in req.user
    const userAddress = req.user?.address;
    
    if (!userAddress) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Check if user has already claimed
    const hasClaimed = await checkAddressClaimed(userAddress);
    if (hasClaimed) {
      return res.status(400).json({
        success: false,
        error: 'Address has already claimed tokens'
      });
    }
    
    // Claim tokens for the authenticated user
    const result = await claimTokensForAddress(userAddress);
    
    res.json({
      success: true,
      data: {
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        address: userAddress,
        message: 'Tokens claimed successfully'
      }
    });
    
  } catch (error: any) {
    console.error('Error claiming tokens:', error);
    
    // Handle specific blockchain errors
    if (error.message.includes('already claimed')) {
      return res.status(400).json({
        success: false,
        error: 'Tokens have already been claimed for this address'
      });
    }
    
    if (error.message.includes('insufficient funds')) {
      return res.status(503).json({
        success: false,
        error: 'Faucet is currently out of funds. Please try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to claim tokens',
      message: error.message
    });
  }
}

export async function getFaucetStatus(req: Request, res: Response) {
  try {
    const { address } = req.params;
    const userAddress = req.user?.address;
    
    // Verify that the requested address matches the authenticated user
    if (address.toLowerCase() !== userAddress?.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'You can only check status for your own address'
      });
    }
    
    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }
    
    // Get all required data in parallel
    const [hasClaimed, balance, users, faucetAmount] = await Promise.all([
      checkAddressClaimed(address),
      getAddressBalance(address),
      getFaucetUsers(),
      getFaucetAmount()
    ]);
    
    res.json({
      success: true,
      data: {
        address: address.toLowerCase(),
        hasClaimed,
        balance,
        faucetAmount,
        totalUsers: users.length,
        users: [...users].slice(0, 50) // Limit to first 50 users for response size
      }
    });
    
  } catch (error: any) {
    console.error('Error getting faucet status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get faucet status',
      message: error.message
    });
  }
}

export async function getFaucetInfo(req: Request, res: Response) {
  try {
    // Get general faucet information (no authentication required)
    const [users, faucetAmount] = await Promise.all([
      getFaucetUsers(),
      getFaucetAmount()
    ]);
    
    res.json({
      success: true,
      data: {
        faucetAmount,
        totalUsers: users.length,
        recentUsers: [...users].slice(-10).reverse() // Last 10 users, most recent first
      }
    });
    
  } catch (error: any) {
    console.error('Error getting faucet info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get faucet information',
      message: error.message
    });
  }
}
