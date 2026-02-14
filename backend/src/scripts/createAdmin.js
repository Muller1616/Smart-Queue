import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@example.com";
    const adminPassword = "adminpassword"; // Change this in production

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const admin = await User.create({
      name: "Admin User",
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN",
    });

    console.log("Admin user created successfully");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
