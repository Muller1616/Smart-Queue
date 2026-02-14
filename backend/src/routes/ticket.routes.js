import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { joinQueue } from "../controllers/ticket.controller.js";
import adminOnly from "../middlewares/admin.middleware.js";
import { serveNextTicket } from "../controllers/ticket.controller.js";
import { getQueue } from "../controllers/ticket.controller.js";
import { getMyTicket } from "../controllers/ticket.controller.js";
import { cancelMyTicket } from "../controllers/ticket.controller.js";
import { getQueueStats } from "../controllers/ticket.controller.js";


const router = express.Router();

router.post("/join", protect, joinQueue);
router.patch("/next", protect, adminOnly, serveNextTicket);
router.get("/queue", protect, getQueue);
router.get("/my-ticket", protect, getMyTicket);
router.put("/cancel", protect, cancelMyTicket);
router.get("/stats", protect, adminOnly, getQueueStats);





export default router;
