import express from "express";
import { placeBet, resolveBet } from "./bet.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/place", protect, placeBet);
router.post("/resolve", protect, resolveBet);

export default router;