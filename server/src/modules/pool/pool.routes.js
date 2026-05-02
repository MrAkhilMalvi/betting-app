import express from "express";
import * as controller from "./pool.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/active", controller.getActivePool);
router.post("/join", protect, controller.joinPool);
router.post("/create", controller.createPool);
router.post("/draw/:id", controller.drawWinner);

export default router;