import jwt from "jsonwebtoken";
import cookie from "cookie";

export default async function socketAuth(socket, next) {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Unauthorized"));
    }

    const cookies = cookie.parse(cookieHeader);
    const accessToken = cookies.rocket_access_token;

    if (!accessToken) {
      return next(new Error("No access token"));
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    socket.user = {
      id: decoded.id,
      username: decoded.username || null,
    };

    next();
  } catch (err) {
    console.error("Socket auth failed:", err.message);

    next(new Error("Unauthorized"));
  }
}
