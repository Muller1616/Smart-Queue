import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port https://localhost:${PORT}`);
});
