import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import adminOnly from "../middlewares/admin.middleware.js";
import { 
    joinQueue, 
    serveNextTicket, 
    getQueue, 
    getMyTicket, 
    cancelMyTicket, 
    getQueueStats,
    completeTicket
} from "../controllers/ticket.controller.js";


const router = express.Router();

router.post("/join", protect, joinQueue);
router.patch("/next", protect, adminOnly, serveNextTicket);
router.patch("/:id/complete", protect, adminOnly, completeTicket);
router.get("/queue", protect, getQueue);
router.get("/my-ticket", protect, getMyTicket);
router.put("/cancel", protect, cancelMyTicket);
router.get("/stats", protect, adminOnly, getQueueStats);

export default router;
