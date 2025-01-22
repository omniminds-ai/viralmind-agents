import mongoose from 'mongoose';
import { VPSRegion } from '../services/gym-vps/types.ts';

export const raceSessionSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    address: { type: String, required: true },
    challenge: { type: String, ref: 'Challenge', required: true },
    prompt: { type: String, required: true },
    category: {
      type: String,
      enum: ['creative', 'mouse', 'slacker', 'gaming', 'wildcard'],
      required: true
    },
    vm_ip: { type: String, required: true },
    vm_port: { type: Number, required: true },
    vm_password: { type: String, required: true },
    vm_region: { type: String, enum: Object.values(VPSRegion), required: true },
    vm_credentials: {
      guacToken: { type: String, required: false },
      guacConnectionId: { type: String, required: false },
      guacClientId: { type: String, required: false },
      username: { type: String, required: true },
      password: { type: String, required: true }
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired'],
      default: 'active'
    },
    video_path: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'race_sessions' }
);

// Update the updated_at timestamp on save
raceSessionSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

export const RaceSession = mongoose.model('RaceSession', raceSessionSchema);
