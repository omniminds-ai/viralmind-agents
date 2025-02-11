import mongoose from "mongoose";

// Store generated races
export const forgeRaceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    icon: { type: String, required: true },
    skills: [{ type: String, required: true }],
    agent_prompt: { type: String, required: true },
    pool_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingPool', required: true }
  },
  { 
    collection: "forge_races",
    timestamps: true 
  }
);

export const ForgeRace = mongoose.model("ForgeRace", forgeRaceSchema);
