import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookie from "cookie-parser";
import "./DbConfigs/dbConfig.js";
import "./Helpers/orderCrone.js";
import "./Helpers/reservationCrone.js"
import Inventory from "./Models/inventoryModel.js";
import Menu from "./Models/menuModel.js";
import Order from "./Models/orderModel.js";
import Reserve from "./Models/reserveModel.js";
import User from "./Models/userModel.js";
import Restaurant from "./Models/restaurantModel.js";
import authRoute from "./Routes/authRoute.js";
import userRoute from "./Routes/userRoute.js";
import menuRoute from "./Routes/menuRoute.js";
import restaurantRoute from "./Routes/restaurantRoute.js";
import inventoryRoute from "./Routes/inventoryRoute.js";
import reserveRoute from "./Routes/reserveRoute.js";
import orderRoute from "./Routes/orderRoute.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookie());
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/menu", menuRoute);
app.use("/restaurant", restaurantRoute);
app.use("/inventory", inventoryRoute);
app.use("/reserve", reserveRoute);
app.use("/order", orderRoute);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on the port ${port}`);
});
