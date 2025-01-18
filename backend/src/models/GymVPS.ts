import mongoose from "mongoose";

export const gymVPSSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    ip: { type: String, required: true },
    droplet_id: { type: Number, required: true },
    name: { type: String, required: true },
    login: {
      type: {
        username: { type: String, required: true },
        password: { type: String, required: true },
      },
      required: true,
    },
    vnc: {
      type: {
        password: { type: String, required: true },
      },
      required: true,
    },
    status: { type: String, enum: ["assigned", "open"], required: true },
    address: { type: String, required: false },
  },
  { collection: "gym-servers" }
);

export const GymVPS = mongoose.model("GymVPS", gymVPSSchema);
