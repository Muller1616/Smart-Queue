import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true
    },
    ticketNumber: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["waiting", "serving", "completed"],
      default: "waiting"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
