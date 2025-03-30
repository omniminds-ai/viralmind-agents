import { ApiError } from './types/errors.ts';
import { NextFunction, Request, Response } from 'express';
import { WalletConnectionModel } from '../models/Models.ts';

// Middleware to resolve connect token to wallet address
export async function requireWalletAddress(req: Request, _res: Response, next: NextFunction) {
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
