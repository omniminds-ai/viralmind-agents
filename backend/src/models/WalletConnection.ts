import { Schema, model } from 'mongoose';

export interface WalletConnection {
  token: string;
  address: string;
  createdAt: Date;
}

const walletConnectionSchema = new Schema<WalletConnection>(
  {
    token: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Expire after 1 hour
  },
  { collection: 'wallet_connections' }
);

export const WalletConnectionModel = model<WalletConnection>(
  'WalletConnection',
  walletConnectionSchema
);
