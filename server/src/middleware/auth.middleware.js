import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { generateAccessToken } from "../utils/token.js";

export const protect = async (req, res, next) => {
  try {
    const accessToken = req.cookies.rocket_access_token;
    const refreshToken = req.cookies.rocket_refresh_token;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

        req.user = {
          id: decoded.id,
          username: decoded.username || null,
        };

        return next();
      } catch (err) {
        if (err.name !== "TokenExpiredError") {
          return res.status(401).json({
            message: "Invalid access token",
          });
        }
      }
    }

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    let decodedRefresh;

    try {
      decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    } catch {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const sessionRes = await pool.query(
      `
        SELECT id
        FROM sessions
        WHERE refresh_token = $1
        AND user_id = $2
        AND expires_at > NOW()
        LIMIT 1
        `,
      [refreshToken, decodedRefresh.id],
    );

    if (!sessionRes.rows.length) {
      return res.status(401).json({
        message: "Session expired",
      });
    }

    const newAccessToken = generateAccessToken({
      id: decodedRefresh.id,
      username: decodedRefresh.username,
    });
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("rocket_access_token", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    req.user = {
      id: decodedRefresh.id,
      username: decodedRefresh.username || null,
    };

    next();
  } catch (err) {
    next(err);
  }
};
