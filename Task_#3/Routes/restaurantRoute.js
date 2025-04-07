import mongoose from "mongoose";
import express from "express";
import {
  registerRestaurant,
  restaurantLogIn,
  updateRestaurant,
} from "../Controllers/restaurantController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register-restaurant", registerRestaurant);
router.post("/restaurant-login", restaurantLogIn);
router.put("/update-restaurant", verifyToken,  updateRestaurant);

export default router;
