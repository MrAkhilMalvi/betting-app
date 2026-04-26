import jwt from "jsonwebtoken";

// 🎯 Common payload builder
const basePayload = (user) => ({
  id: user.id,
  // optional future-safe fields:
  username: user.username || null
});

// 🔐 Access Token
export const generateAccessToken = (user) =>
  jwt.sign(
    {
      ...basePayload(user),
      type: "access"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
      issuer: "crash-game",
      audience: "user"
    }
  );

// 🔁 Refresh Token
export const generateRefreshToken = (user) =>
  jwt.sign(
    {
      ...basePayload(user),
      type: "refresh"
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
      issuer: "crash-game",
      audience: "user"
    }
  );