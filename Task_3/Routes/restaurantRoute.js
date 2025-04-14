import mongoose from "mongoose";
import express from "express";
import {
  registerRestaurant,
  restaurantLogIn,
  updateRestaurant,
} from "../Controllers/restaurantController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const restaurantRouter = express.Router();

restaurantRouter.post("/register-restaurant", registerRestaurant);
restaurantRouter.post("/restaurant-login", restaurantLogIn);
restaurantRouter.put("/update-restaurant", verifyToken,  updateRestaurant);

export default restaurantRouter;
