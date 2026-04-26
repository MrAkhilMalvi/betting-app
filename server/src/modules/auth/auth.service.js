import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken
} from "../../utils/token.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔵 Signup (WITH WALLET)
export const signupUser = async (data) => {
  const { username, email, password } = data;

  if (!username || !password) {
    throw new Error("INVALID_INPUT");
  }

  const clientDB = await pool.connect();

  try {
    await clientDB.query("BEGIN");

    const existing = await clientDB.query(
      "SELECT id FROM users WHERE username=$1 OR email=$2",
      [username, email || null]
    );

    if (existing.rows.length) {
      throw new Error("USER_EXISTS");
    }

    const hashed = await bcrypt.hash(password, 10);

    const userRes = await clientDB.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email || null, hashed]
    );

    const user = userRes.rows[0];

    // 🪙 Create wallet
    await clientDB.query(
      "INSERT INTO wallets (user_id, balance) VALUES ($1, 1000)",
      [user.id]
    );

    await clientDB.query("COMMIT");

    return user;

  } catch (err) {
    await clientDB.query("ROLLBACK");
    throw err;
  } finally {
    clientDB.release();
  }
};


// 🔵 Login (USERNAME OR EMAIL)
export const loginUser = async (identifier, password, meta) => {
  const userRes = await pool.query(
    "SELECT * FROM users WHERE email=$1 OR username=$1",
    [identifier]
  );

  if (!userRes.rows.length) throw new Error("NOT_FOUND");

  const user = userRes.rows[0];

  const match = await bcrypt.compare(password, user.password || "");
  if (!match) throw new Error("INVALID");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await pool.query(
    `INSERT INTO sessions(user_id, refresh_token, user_agent, ip_address, expires_at)
     VALUES($1,$2,$3,$4,NOW() + interval '7 days')`,
    [user.id, refreshToken, meta.ua, meta.ip]
  );

  return { user, accessToken, refreshToken };
};


// 🔵 Google Login (FIXED)
export const googleUser = async (token, meta) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, sub, picture } = payload;

  let userRes = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

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
        [username, email, sub, picture]
      );

      user = insert.rows[0];

      // 🪙 Create wallet
      await clientDB.query(
        "INSERT INTO wallets(user_id, balance) VALUES($1, 1000)",
        [user.id]
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
    [user.id, refreshToken, meta.ua, meta.ip]
  );

  return { user, accessToken, refreshToken };
};


// 🔴 Logout
export const logoutUser = async (refreshToken) => {
  await pool.query(
    "DELETE FROM sessions WHERE refresh_token=$1",
    [refreshToken]
  );
};