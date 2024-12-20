import { createHash } from "crypto";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const hashString = (str) => {
  return createHash("sha256").update(str, "utf-8").digest();
};

export const calculateDiscriminator = (instructionName) => {
  const hash = createHash("sha256")
    .update(`global:${instructionName}`, "utf-8")
    .digest();
  return hash.slice(0, 8); // Extract first 8 bytes
};

export const SOLANA_RPC = process.env.RPC_URL;
