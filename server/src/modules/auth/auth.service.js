import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signupUser = async (data) => {
  const { username, email, password } = data;

  if (!username || !password) {
    throw new Error("INVALID_INPUT");
  }

  const hashed = await bcrypt.hash(password, 10);

  const result = await pool.query("SELECT * FROM signup_user($1, $2, $3)", [
    username,
    email || null,
    hashed,
  ]);

  return result.rows[0];
};

export const loginUser = async (identifier, password, meta) => {
  const userRes = await pool.query(
    `SELECT * FROM users
     WHERE email=$1 OR username=$1`,
    [identifier],
  );

  if (!userRes.rows.length) {
    throw new Error("NOT_FOUND");
  }

  const user = userRes.rows[0];

  const match = await bcrypt.compare(password, user.password || "");

  if (!match) {
    throw new Error("INVALID");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await pool.query("SELECT create_session($1,$2,$3,$4)", [
    user.id,
    refreshToken,
    meta.ua,
    meta.ip,
  ]);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// 🔵 Google Login (FIXED)
export const googleUser = async (token, meta) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, sub, picture } = payload;

  let userRes = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

  let user;

  if (!userRes.rows.length) {
    const clientDB = await pool.connect();

    try {
      await clientDB.query("BEGIN");

      const username = name.replace(/\s+/g, "").toLowerCase();

      const insert = await clientDB.query(
        `INSERT INTO users(username, email, google_id, avatar)
         VALUES($1,$2,$3,$4)
         RETURNING *`,
        [username, email, sub, picture],
      );

      user = insert.rows[0];

      // 🪙 Create wallet
      await clientDB.query(
        "INSERT INTO wallets(user_id, balance) VALUES($1, 0)",
        [user.id],
      );

      await clientDB.query("COMMIT");
    } catch (err) {
      await clientDB.query("ROLLBACK");
      throw err;
    } finally {
      clientDB.release();
    }
  } else {
    user = userRes.rows[0];
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await pool.query(
    `INSERT INTO sessions(user_id, refresh_token, user_agent, ip_address, expires_at)
     VALUES($1,$2,$3,$4,NOW() + interval '7 days')`,
    [user.id, refreshToken, meta.ua, meta.ip],
  );

  return { user, accessToken, refreshToken };
};

// 🔴 Logout
export const logoutUser = async (refreshToken) => {
  await pool.query("DELETE FROM sessions WHERE refresh_token=$1", [
    refreshToken,
  ]);
};

export const claimWelcomeBonus = async (userId) => {
  const result = await pool.query(
    `
      SELECT *
      FROM claim_welcome_bonus($1)
      `,
    [userId],
  );

  return {
    success: true,
    balance: result.rows[0].balance,
  };
};
