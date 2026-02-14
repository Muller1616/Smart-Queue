import Ticket from "../models/Ticket.js";
import Queue from "../models/Queue.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Counter from "../models/Counter.js";

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

  // 3️⃣ Generate ticket number (FIFO)
  const lastTicket = await Ticket.find({ queue: queueId })
    .sort({ ticketNumber: -1 })
    .limit(1);

  const nextTicketNumber =
    lastTicket.length === 0 ? 1 : lastTicket[0].ticketNumber + 1;

  // 2. Increment ticket counter
  const counter = await Counter.findOneAndUpdate(
    { name: "ticketNumber" },
    { $inc: { value: 1 } },
    { new: true, upsert: true },
  );

  // 4️⃣ Create ticket
  const ticket = await Ticket.create({
    user: userId,
    queue: queueId,
    ticketNumber: nextTicketNumber,
  });

  // 5️⃣ Calculate position
  const position = await Ticket.countDocuments({
    queue: queueId,
    status: "waiting",
    ticketNumber: { $lte: ticket.ticketNumber },
  });

  res.status(201).json({
    success: true,
    message: "Successfully joined the queue",
    data: {
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      position,
    },
  });
});

export const serveNextTicket = async (req, res) => {
  // 1. Find the oldest waiting ticket
  const ticket = await Ticket.findOne({ status: "waiting" }).sort({
    createdAt: 1,
  });

  // 2. If no tickets
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: "No tickets in the queue",
    });
  }

  // 3. Mark as served
  ticket.status = "served";
  await ticket.save();

  // 4. Return response
  res.status(200).json({
    success: true,
    message: "Next ticket served",
     data: {
      ticketNumber: ticket.number,
      user: ticket.user,
      status: ticket.status,
    },
  });
};

// get queue status (list of waiting tickets)
export const getQueue = async (req, res) => {
  const tickets = await Ticket.find({ status: "waiting" })
    .sort({ number: 1 })
    .select("number status createdAt");

  res.json({
    success: true,
    count: tickets.length,
    data: tickets,
  });
};


// get users ticket status

export const getMyTicket = async (req, res) => {
  const userId = req.user.id;

  // Find user's active ticket
  const ticket = await Ticket.findOne({
    user: userId,
    status: "waiting",
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: "No active ticket found",
    });
  }

  // Count how many tickets are ahead
  const position = await Ticket.countDocuments({
    status: "waiting",
    number: { $lt: ticket.number },
  });

  res.json({
    success: true,
    data: {
      ticketNumber: ticket.number,
      status: ticket.status,
      position: position + 1,
    },
  });
};


// cancel my ticket

export const cancelMyTicket = async (req, res) => {
  const userId = req.user.id;

  const ticket = await Ticket.findOne({
    user: userId,
    status: "waiting",
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: "No active ticket to cancel",
    });
  }

  ticket.status = "cancelled";
  await ticket.save();

  res.status(200).json({
    success: true,
    message: "Ticket cancelled successfully",
  });
};

// get queue status (list of waiting tickets)

export const getQueueStats = async (req, res) => {
  const total = await Ticket.countDocuments();
  const waiting = await Ticket.countDocuments({ status: "waiting" });
  const served = await Ticket.countDocuments({ status: "served" });
  const cancelled = await Ticket.countDocuments({ status: "cancelled" });

  res.status(200).json({
    success: true,
    data: {
      total,
      waiting,
      served,
      cancelled,
    },
  });
};
