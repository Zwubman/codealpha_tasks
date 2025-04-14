import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const dbConfig = async () => {
  try {
    const response = await mongoose.connect(`${process.env.MONGO_URL}`);

    if (response) {
      console.log("Connected to DB...");
    }
  } catch (error) {
    console.log("Error connecting to DB:", error);
  }
};

dbConfig();
