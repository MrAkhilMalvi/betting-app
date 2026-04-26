export const errorHandler = (err, req, res, next) => {
  // 🔐 Log (keep detailed logs internally only)
  console.error("🔥 ERROR:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // =========================
  // ✅ CUSTOM APP ERRORS
  // =========================

  const errorMap = {
    USER_EXISTS: [409, "User already exists"],
    INVALID_INPUT: [400, "Invalid input data"],
    NOT_FOUND: [404, "User not found"],
    INVALID: [401, "Invalid credentials"],
    UNAUTHORIZED: [401, "Unauthorized"],
    FORBIDDEN: [403, "Access denied"],

    // 🪙 Betting-specific
    INSUFFICIENT_BALANCE: [400, "Not enough balance"],
    BET_NOT_ALLOWED: [400, "Bet not allowed at this time"],
    ROUND_CLOSED: [400, "Game round is closed"],
    ALREADY_CASHED_OUT: [400, "Already cashed out"],
    INVALID_BET_AMOUNT: [400, "Invalid bet amount"]
  };

  if (errorMap[err.message]) {
    [statusCode, message] = errorMap[err.message];
  }

  // =========================
  // 🗄️ POSTGRES ERRORS
  // =========================

  if (err.code === "23505") {
    statusCode = 409;
    message = "Duplicate value already exists";
  }

  if (err.code === "23503") {
    statusCode = 400;
    message = "Invalid reference (foreign key error)";
  }

  if (err.code === "23514") {
    statusCode = 400;
    message = "Constraint violation";
  }

  // =========================
  // 🔐 JWT ERRORS
  // =========================

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired";
  }

  // =========================
  // ⚠️ FALLBACK SAFETY
  // =========================

  if (statusCode === 500) {
    message = "Something went wrong";
  }

  // =========================
  // 📦 RESPONSE
  // =========================

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      error: err.message
    })
  });
};