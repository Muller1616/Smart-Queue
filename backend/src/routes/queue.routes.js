import express from "express";
import { getAllQueues, createQueue, getQueueById, deleteQueue, resetQueue } from "../controllers/queue.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import adminOnly from "../middlewares/admin.middleware.js";

const router = express.Router();

router.get("/", protect, getAllQueues);
router.post("/", protect, adminOnly, createQueue);
router.get("/:id", protect, getQueueById);
router.delete("/:id", protect, adminOnly, deleteQueue);
router.post("/:id/reset", protect, adminOnly, resetQueue);

export default router;
