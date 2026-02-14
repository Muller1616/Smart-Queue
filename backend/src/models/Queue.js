import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    currentNumber: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Queue", queueSchema);
