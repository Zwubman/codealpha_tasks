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

const router = express.Router();

router.post("/place-order/:id", verifyToken, placeOrder);
router.post("/cancel-order/:id", verifyToken, cancelOrder);
router.post("/order-payment", verifyToken,  payForOrder);
router.get("/callback",verifyToken, paymentCallback);
router.get("/orders-per-item", verifyToken, checkChefRole, getAllOrderPerItem);
router.get("/all-orders", verifyToken, checkChefRole,  getAllOrder);
router.put("/update-status/:id", verifyToken, checkChefRole, updateOrderStatus);
router.get("/my-orders", verifyToken, getMyOrders)

export default router;
