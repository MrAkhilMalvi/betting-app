import * as service from "./auth.service.js";
import { setAuthCookies } from "../../utils/cookies.js";
import pool from "../../config/db.js";

export const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.email,
        u.avatar,
        u.bonus_claimed,

        COALESCE(w.balance, 0) AS balance

      FROM users u

      LEFT JOIN wallets w
      ON u.id = w.user_id

      WHERE u.id = $1
      `,
      [req.user.id],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const signup = async (req, res, next) => {
  try {
    const user = await service.signupUser(req.body);

    res.status(201).json({
      success: true,
      message: "Signup successful",
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const meta = {
      ua: req.headers["user-agent"],
      ip: req.ip,
    };

    const { user, accessToken, refreshToken } = await service.loginUser(
      req.body.identifier,
      req.body.password,
      meta,
    );

    setAuthCookies(res, accessToken, refreshToken);

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const meta = {
      ua: req.headers["user-agent"],
      ip: req.ip,
    };

    const { user, accessToken, refreshToken } = await service.googleUser(
      req.body.token,
      meta,
    );

    setAuthCookies(res, accessToken, refreshToken);

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await service.logoutUser(req.cookies.refreshToken);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

export const claimWelcomeBonus = async (req, res, next) => {
  try {
    const result = await service.claimWelcomeBonus(req.user.id);

    res.json({
      success: true,
      message: "1000 coins claimed successfully!",
      balance: result.balance,
    });
  } catch (err) {
    if (err.message === "BONUS_ALREADY_CLAIMED") {
      return res.status(400).json({
        success: false,
        message: "Welcome bonus already claimed",
      });
    }
  }
};
