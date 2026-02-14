import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(
      "User already exists. Please login or register with a different email.",
      409
    );
  }

  const user = await User.create({ name, email, password });
  
  // Remove password from response
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token: generateToken(user._id),
    data: { user }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: generateToken(user._id),
    data: { user }
  });
});
