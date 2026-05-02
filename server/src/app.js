import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import walletRoutes from "./modules/wallet/wallet.routes.js";
import betRoutes from "./modules/bet/bet.routes.js";
import poolRoutes from "./modules/pool/pool.routes.js";

const app = express();

// ✅ Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS
app.use(cors({
  origin: process.env.CLIENT_URL|| "http://localhost:5173",
  credentials: true,
}));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/bet", betRoutes);
app.use("/api/pool", poolRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Betting API running 🚀");
});

// ✅ Error handler (LAST)
app.use(errorHandler);

export default app;