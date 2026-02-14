import Queue from "../models/Queue.js";
import Ticket from "../models/Ticket.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { getIO } from "../socket.js";

// @desc    Get all queues
// @route   GET /api/queues
// @access  Public (or Protected)
export const getAllQueues = asyncHandler(async (req, res) => {
  const queues = await Queue.find({ isActive: true });

  res.status(200).json({
    success: true,
    count: queues.length,
    data: queues,
  });
});

// @desc    Create a queue
// @route   POST /api/queues
// @access  Admin
export const createQueue = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new AppError("Queue name is required", 400);
  }

  const queue = await Queue.create({ name });

  // Emit socket event
  getIO().emit("queue:update", { 
      type: "create",
      queue 
  });

  res.status(201).json({
    success: true,
    message: "Queue created successfully",
    data: queue,
  });
});

// @desc    Get queue by ID
// @route   GET /api/queues/:id
// @access  Public
export const getQueueById = asyncHandler(async (req, res) => {
  const queue = await Queue.findById(req.params.id);

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  res.status(200).json({
    success: true,
    data: queue,
  });
});

// @desc    Delete a queue
// @route   DELETE /api/queues/:id
// @access  Admin
export const deleteQueue = asyncHandler(async (req, res) => {
  const queue = await Queue.findById(req.params.id);

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  // Optional: Check if there are active tickets? 
  // For now, let's just delete it. Mongoose middleware could cascade delete tickets if set up, 
  // but let's manually clean up active tickets or just leave them as orphaned/cancelled.
  // Better to mark them cancelled.
  await Ticket.updateMany(
    { queue: req.params.id, status: { $in: ["waiting", "serving"] } },
    { status: "cancelled" }
  );

  await queue.deleteOne();

  getIO().emit("queue:update", { type: "delete", queueId: req.params.id });
  getIO().emit("ticket:update", { type: "bulk_cancel", queueId: req.params.id });

  res.status(200).json({
    success: true,
    message: "Queue deleted successfully",
  });
});

// @desc    Reset a queue (clear tickets)
// @route   POST /api/queues/:id/reset
// @access  Admin
export const resetQueue = asyncHandler(async (req, res) => {
  const queue = await Queue.findById(req.params.id);

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  await Ticket.updateMany(
    { queue: req.params.id, status: { $in: ["waiting", "serving"] } },
    { status: "cancelled" }
  );

  // Reset current number? If we were using per-queue counters.
  // Since we use global counter for ticket number, we don't reset that to avoid collision.
  // But we cleared the waiting list.

  getIO().emit("ticket:update", { type: "reset", queueId: req.params.id });

  res.status(200).json({
    success: true,
    message: "Queue reset successfully",
  });
});
