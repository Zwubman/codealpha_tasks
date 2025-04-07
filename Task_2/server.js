import mongoose from "mongoose";
import express from "express";
import './DbConfigs/dbConfig.js'
import dotenv from "dotenv";
import Event from "./Models/eventModel.js";
import User from "./Models/userModel.js";
import userRoute from "./Routes/userRoute.js"
import eventRoute from "./Routes/eventRoute.js"
import cors from "cors"


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use('/users', userRoute);
app.use('/events', eventRoute);


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`the server is running on the port ${port}`);
})