import mongoose from 'mongoose';

const gymSessionSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['active', 'completed', 'expired'], required: true },
  preview: { type: String },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true }
});

export const GymSession = mongoose.model('GymSession', gymSessionSchema);
export { gymSessionSchema };
