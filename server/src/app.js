import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// ✅ Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Betting API running 🚀");
});

// ✅ Error handler (LAST)
app.use(errorHandler);

export default app;