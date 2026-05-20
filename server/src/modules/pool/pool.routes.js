import express from "express";
import * as controller from "./pool.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();


router.get("/active", controller.getActivePool);
router.get("/history", controller.getPoolHistory);
router.get("/:poolId", controller.getPoolById);
router.post("/join", protect, controller.joinPool);
router.post("/create", controller.createPool);

export default router;