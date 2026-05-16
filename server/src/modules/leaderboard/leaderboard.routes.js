import express from "express";
import { getWeeklyLeaderboardController } from "./leaderboard.controller.js";

const router = express.Router();

router.get("/weekly", getWeeklyLeaderboardController);

export default router;