import { Request, Response } from 'express';
import { SiweMessage } from 'siwe';
import { generateToken } from '../utils/jwt.js';

// In-memory store for nonces (in production, use Redis or database)
const nonceStore = new Map<string, { nonce: string; timestamp: number }>();

// Clean up old nonces (older than 10 minutes)
setInterval(() => {
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;
  
  for (const [address, data] of nonceStore.entries()) {
    if (now - data.timestamp > tenMinutes) {
      nonceStore.delete(address);
    }
  }
}, 5 * 60 * 1000); // Run cleanup every 5 minutes

export async function getMessage(req: Request, res: Response) {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }
    
    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }
    
    // Generate a random nonce
    const nonce = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    // Store nonce with timestamp
    nonceStore.set(address.toLowerCase(), {
      nonce,
      timestamp: Date.now()
    });
    
    // Create SIWE message
    const domain = req.get('host') || 'localhost:3001';
    const origin = req.get('origin') || 'http://localhost:5173';
    
    const siweMessage = new SiweMessage({
      domain,
      address,
      statement: 'Sign in to Faucet DApp to claim tokens',
      uri: origin,
      version: '1',
      chainId: 11155111, // Sepolia testnet
      nonce,
      issuedAt: new Date().toISOString(),
    });
    
    const message = siweMessage.prepareMessage();
    
    res.json({
      success: true,
      data: {
        message,
        nonce
      }
    });
    
  } catch (error: any) {
    console.error('Error generating SIWE message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sign-in message',
      message: error.message
    });
  }
}

export async function signIn(req: Request, res: Response) {
  try {
    const { message, signature, address } = req.body;
    
    if (!message || !signature || !address) {
      return res.status(400).json({
        success: false,
        error: 'Message, signature, and address are required'
      });
    }
    
    // Get stored nonce
    const storedData = nonceStore.get(address.toLowerCase());
    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'No pending sign-in request found for this address'
      });
    }
    
    // Check if nonce is too old (10 minutes)
    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - storedData.timestamp > tenMinutes) {
      nonceStore.delete(address.toLowerCase());
      return res.status(400).json({
        success: false,
        error: 'Sign-in request has expired. Please request a new message.'
      });
    }
    
    try {
      // Parse and verify the SIWE message
      const siweMessage = new SiweMessage(message);
      
      // Verify the signature
      const verificationResult = await siweMessage.verify({ 
        signature,
        domain: req.get('host') || 'localhost:3001',
        nonce: storedData.nonce
      });
      
      if (!verificationResult.success) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature or message verification failed'
        });
      }
      
      // Verify address matches
      if (siweMessage.address.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({
          success: false,
          error: 'Address mismatch in signature verification'
        });
      }
      
      // Clean up used nonce
      nonceStore.delete(address.toLowerCase());
      
      // Generate JWT token
      const token = generateToken(address);
      
      res.json({
        success: true,
        data: {
          token,
          address: address.toLowerCase(),
          message: 'Authentication successful'
        }
      });
      
    } catch (verifyError: any) {
      console.error('SIWE verification error:', verifyError);
      return res.status(401).json({
        success: false,
        error: 'Signature verification failed',
        message: verifyError.message
      });
    }
    
  } catch (error: any) {
    console.error('Error during sign-in:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
}
