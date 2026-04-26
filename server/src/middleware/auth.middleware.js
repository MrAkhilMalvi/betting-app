import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const protect = async (req, res, next) => {
  try {
    const accessToken = req.cookies.rocket_access_token;
    const refreshToken = req.cookies.rocket_refresh_token;

    console.log("COOKIES:", req.cookies); // 🔥 debug

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = decoded;
      return next();

    } catch (err) {

      if (err.name === "TokenExpiredError" && refreshToken) {

        let decodedRefresh;

        try {
          decodedRefresh = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET
          );
        } catch {
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        const sessionRes = await pool.query(
          `SELECT * FROM sessions 
           WHERE refresh_token=$1 
           AND user_id=$2 
           AND expires_at > NOW()`,
          [refreshToken, decodedRefresh.id]
        );

        if (!sessionRes.rows.length) {
          return res.status(401).json({ message: "Session expired" });
        }

        // 🔄 New access token
        const newAccessToken = jwt.sign(
          { id: decodedRefresh.id },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        res.cookie("rocket_access_token", newAccessToken, {
          httpOnly: true,
          secure: false, // 🔥 IMPORTANT for localhost
          sameSite: "lax",
          maxAge: 15 * 60 * 1000,
          path: "/"
        });

        req.user = { id: decodedRefresh.id };
        return next();
      }

      return res.status(401).json({ message: "Invalid token" });
    }

  } catch (err) {
    next(err);
  }
};