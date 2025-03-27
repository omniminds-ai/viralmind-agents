import { NextFunction, Request, Response } from 'express';
import { WalletConnectionModel } from '../../models/Models.ts';
import { ApiError } from '../../api/types/errors.ts';

// Middleware to resolve connect token to wallet address
export async function requireWalletAddress(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-connect-token'];
  if (!token || typeof token !== 'string') {
    throw ApiError.unauthorized('Connect token is required');
  }

  const connection = await WalletConnectionModel.findOne({ token });
  if (!connection) {
    throw ApiError.unauthorized('Invalid connect token');
  }

  // Add the wallet address to the request object
  // @ts-ignore - Add walletAddress to the request object
  req.walletAddress = connection.address;
  next();
}

// Function to get address from connect token (for use in routes)
export async function getAddressFromToken(token: string): Promise<string | null> {
  if (!token) return null;
  const connection = await WalletConnectionModel.findOne({ token });
  return connection?.address || null;
}
