import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error);

    process.exit(1);
  }
}

testConnection();