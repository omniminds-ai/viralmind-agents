import mongoose from "mongoose";

export const gymVPSSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    ip: { type: String, required: true },
    region: { type: String, required: true },
    username: { type: String, required: true },
    ssh_keypair: {
      type: {
        public: { type: String, required: true },
        private: { type: String, required: true },
      },
      required: true,
    },
    users: {
      type: [
        {
          username: { type: String, required: true },
          password: { type: String, required: true },
        },
      ],
      required: true,
    },
  },
  { collection: "gym-servers" }
);

export const GymVPS = mongoose.model("GymVPS", gymVPSSchema);
