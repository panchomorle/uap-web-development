import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface JWTPayload {
  address: string;
  iat?: number;
  exp?: number;
}

export function generateToken(address: string): string {
  try {
    const payload: JWTPayload = {
      address: address.toLowerCase(),
    };
    
    const token = jwt.sign(
      payload, 
      config.jwtSecret, 
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );
    
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Authentication token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid authentication token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header format. Expected: Bearer <token>');
  }
  
  return parts[1];
}
