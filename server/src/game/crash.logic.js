import crypto from "crypto";

// 🔐 Generate random seed
export const generateServerSeed = () => {
  return crypto.randomBytes(32).toString("hex");
};

// 🔒 Hash seed (shown before round)
export const generateHash = (seed) => {
  return crypto.createHash("sha256").update(seed).digest("hex");
};

// 🎲 Convert hash → crash point
export const calculateCrashPoint = (serverSeed) => {
  const hash = generateHash(serverSeed);

  const hex = hash.slice(0, 13);
  const int = parseInt(hex, 16);

  const r = int / Math.pow(2, 52);

  const houseEdge = 0.01;

  // 💥 Instant crash (1% chance)
  if (r < 0.01) return 1;

  const crash =
    Math.floor((100 * (1 - houseEdge)) / (1 - r)) / 100;

  return Math.max(1, crash);
};