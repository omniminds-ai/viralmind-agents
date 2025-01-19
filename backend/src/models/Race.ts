import mongoose from "mongoose";

export const raceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["creative", "mouse", "slacker", "gaming", "wildcard"],
      required: true 
    },
    icon: { type: String, default: "trophy" },
    colorScheme: { 
      type: String, 
      enum: ["pink", "blue", "purple", "orange", "indigo", "emerald"],
      required: false 
    },
    prompt: { type: String, required: true },
    reward: { type: Number, required: true },
    buttonText: { type: String, default: "Join Race" },
    stakeRequired: { type: Number, required: false }
  },
  { collection: "races" }
);

export const Race = mongoose.model("Race", raceSchema);
