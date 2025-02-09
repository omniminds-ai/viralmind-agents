import { Schema, model } from 'mongoose';

export interface TrainingPool {
  id: string;
  name: string;
  status: 'live' | 'paused' | 'out of funds';
  demonstrations: number;
  funds: number;
  token: {
    type: 'SOL' | 'VIRAL' | 'CUSTOM';
    symbol: string;
    address: string;
  };
  skills: string;
  ownerAddress: string;
  depositAddress: string;
  depositPrivateKey: string; // Store private key securely
}

const trainingPoolSchema = new Schema<TrainingPool>(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['live', 'paused', 'out of funds'],
      default: 'live',
      required: true
    },
    demonstrations: { type: Number, default: 0 },
    funds: { type: Number, default: 0 },
    token: {
      type: {
        type: String,
        enum: ['SOL', 'VIRAL', 'CUSTOM'],
        required: true
      },
      symbol: { type: String, required: true },
      address: { type: String, required: true }
    },
    skills: { type: String, required: true },
    ownerAddress: { type: String, required: true },
    depositAddress: { type: String, required: true },
    depositPrivateKey: { type: String, required: true }
  },
  {
    timestamps: true,
    collection: 'training_pools'
  }
);

export const TrainingPoolModel = model<TrainingPool>('TrainingPool', trainingPoolSchema);
