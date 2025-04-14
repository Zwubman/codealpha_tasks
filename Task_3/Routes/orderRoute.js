import mongoose from "mongoose";
import express from "express";
import {
  placeOrder,
  cancelOrder,
  payForOrder,
  paymentCallback,
  getAllOrderPerItem,
  getAllOrder,
  updateOrderStatus,
  getMyOrders,
} from "../Controllers/orderController.js";
import { verifyToken, checkChefRole } from "../Middlewares/authMiddleware.js";

const orderRouter = express.Router();

orderRouter.post("/place-order/:id", verifyToken, placeOrder);
orderRouter.post("/cancel-order/:id", verifyToken, cancelOrder);
orderRouter.post("/order-payment", verifyToken,  payForOrder);
orderRouter.get("/callback",verifyToken, paymentCallback);
orderRouter.get("/orders-per-item", verifyToken, checkChefRole, getAllOrderPerItem);
orderRouter.get("/all-orders", verifyToken, checkChefRole,  getAllOrder);
orderRouter.put("/update-status/:id", verifyToken, checkChefRole, updateOrderStatus);
orderRouter.get("/my-orders", verifyToken, getMyOrders)

export default orderRouter;
