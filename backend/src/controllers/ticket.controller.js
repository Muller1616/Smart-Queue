import Ticket from "../models/Ticket.js";
import Queue from "../models/Queue.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Counter from "../models/Counter.js";
import { getIO } from "../socket.js";

export const joinQueue = asyncHandler(async (req, res) => {
  const { queueId } = req.body;
  const userId = req.user._id;

  if (!queueId) {
    throw new AppError("Queue ID is required", 400);
  }

  // 1️⃣ Check queue exists
  const queue = await Queue.findById(queueId);
  if (!queue || !queue.isActive) {
    throw new AppError("Queue not found or inactive", 404);
  }

  // 2️⃣ Prevent duplicate active ticket
  const existingTicket = await Ticket.findOne({
    user: userId,
    queue: queueId,
    status: { $in: ["waiting", "serving"] },
  });

  if (existingTicket) {
    throw new AppError("You already have an active ticket in this queue", 409);
  }

  // 3️⃣ Generate ticket number
  const counter = await Counter.findOneAndUpdate(
    { name: "ticketNumber" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const nextTicketNumber = counter.value;

  // 4️⃣ Create ticket
  const ticket = await Ticket.create({
    user: userId,
    queue: queueId,
    ticketNumber: nextTicketNumber,
    status: "waiting"
  });

  // 5️⃣ Calculate position
  const position = await Ticket.countDocuments({
    queue: queueId,
    status: "waiting",
    ticketNumber: { $lt: ticket.ticketNumber },
  });

  // Emit socket event
  getIO().emit("ticket:update", { 
      type: "join",
      queueId,
      ticket 
  });

  res.status(201).json({
    success: true,
    message: "Successfully joined the queue",
    data: {
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      position: position + 1, // 1-based index
      queueName: queue.name
    },
  });
});

export const serveNextTicket = asyncHandler(async (req, res) => {
  const { queueId } = req.body;
  
  const query = { status: "waiting" };
  if (queueId) {
    query.queue = queueId;
  }

  // Find the oldest waiting ticket (optionally filtered by queue)
  const ticket = await Ticket.findOne(query)
    .sort({ createdAt: 1 })
    .populate('user', 'name email')
    .populate('queue', 'name');

  if (!ticket) {
    throw new AppError("No tickets in the queue", 404);
  }

  ticket.status = "serving";
  await ticket.save();

  // Emit socket event
  getIO().emit("ticket:update", { 
      type: "serve",
      queueId: ticket.queue._id,
      ticket 
  });

  res.status(200).json({
    success: true,
    message: "Next ticket is now being served",
    data: {
      _id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      user: ticket.user,
      queue: ticket.queue,
      status: ticket.status,
    },
  });
});

// get queue status (list of waiting tickets)
export const getQueue = asyncHandler(async (req, res) => {
  // If queueId is provided in query, filter by it
  const { queueId } = req.query;
  const query = { status: "waiting" };
  if (queueId) query.queue = queueId;

  const tickets = await Ticket.find(query)
    .sort({ ticketNumber: 1 })
    .select("ticketNumber status createdAt user")
    .populate('user', 'name');

  res.status(200).json({
    success: true,
    count: tickets.length,
    data: tickets,
  });
});


// get users ticket status
export const getMyTicket = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find user's active ticket
  const ticket = await Ticket.findOne({
    user: userId,
    status: { $in: ["waiting", "serving"] },
  })
  .populate('queue', 'name');

  if (!ticket) {
    return res.status(200).json({ // Return 200 with null data instead of 404 for better frontend handling
      success: true,
      data: null,
      message: "No active ticket found"
    });
  }

  // Count how many tickets are ahead in the same queue
  const position = await Ticket.countDocuments({
    queue: ticket.queue._id,
    status: "waiting",
    ticketNumber: { $lt: ticket.ticketNumber },
  });

  res.status(200).json({
    success: true,
    data: {
      _id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      position: ticket.status === 'serving' ? 0 : position + 1,
      queue: ticket.queue
    },
  });
});


// cancel my ticket
export const cancelMyTicket = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const ticket = await Ticket.findOne({
    user: userId,
    status: { $in: ["waiting", "serving"] },
  });

  if (!ticket) {
    throw new AppError("No active ticket to cancel", 404);
  }

  ticket.status = "cancelled";
  await ticket.save();

  // Emit socket event
  getIO().emit("ticket:update", { 
      type: "cancel",
      ticket 
  });

  res.status(200).json({
    success: true,
    message: "Ticket cancelled successfully",
  });
});

// get queue stats
export const getQueueStats = asyncHandler(async (req, res) => {
  const total = await Ticket.countDocuments();
  const waiting = await Ticket.countDocuments({ status: "waiting" });
  const served = await Ticket.countDocuments({ status: "served" }); // Completed
  const serving = await Ticket.countDocuments({ status: "serving" }); // Currently serving
  const cancelled = await Ticket.countDocuments({ status: "cancelled" });

  // Get currently serving tickets (could be multiple if multiple queues/admins)
  // For the dashboard, we might want to show the one related to a specific queue or all.
  // Let's return the list of serving tickets.
  const servingTickets = await Ticket.find({ status: "serving" })
    .populate('user', 'name')
    .populate('queue', 'name');

  res.status(200).json({
    success: true,
    data: {
      total,
      waiting,
      served,
      serving,
      cancelled,
      servingTickets // Changed from single currentTicket to array
    },
  });
});

// Mark ticket as completed (served)
export const completeTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
        throw new AppError("Ticket not found", 404);
    }

    if (ticket.status !== "serving") {
        throw new AppError("Ticket is not currently being served", 400);
    }

    ticket.status = "served"; // Mark as done/served
    await ticket.save();

    // Emit socket event
    getIO().emit("ticket:update", { 
        type: "complete",
        ticket 
    });

    res.status(200).json({
        success: true,
        message: "Ticket marked as completed",
        data: ticket
    });
});
