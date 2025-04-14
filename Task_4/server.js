import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import "./DbConfigs/dbConfig.js";
import User from "./Models/userModel.js";
import Job from "./Models/jobModel.js";
import userRoute from "./Routes/userRoute.js";
import jobRoute from "./Routes/jobRoute.js";
dotenv.config();
const app = express();

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(express.json());
app.use("/user", userRoute);
app.use("/job", jobRoute);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on the port ${port}`);
});
