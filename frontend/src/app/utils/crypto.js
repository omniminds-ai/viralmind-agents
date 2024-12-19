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

export const SOLANA_RPC = "https://quick-convincing-dew.solana-devnet.quiknode.pro/65fcb598f2a667509db23c66becf11d58f48c441";
