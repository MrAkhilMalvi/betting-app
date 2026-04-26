import express from "express";
import {
  signup,
  login,
  googleLogin,
  logout,
  getMe 
} from "./auth.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 Auth Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);

// 🔒 Protected
router.get("/me", protect, getMe);

export default router;