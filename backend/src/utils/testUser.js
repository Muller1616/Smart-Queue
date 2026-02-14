import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const user = await User.create({
  name: "Test User",
  email: "test@example.com",
  password: "123456",
});

console.log("User created:", user._id);

process.exit();

export default user;