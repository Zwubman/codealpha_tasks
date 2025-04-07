import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Database connection
const dbConfig = async () => {
  try {
    const response = await mongoose.connect(`${process.env.MONGO_URL}`);
    if (response) {
      console.log("connected to DB");
    }
  } catch (error) {
    console.error("error connecting to DB", error.message);
  }
};

dbConfig();
