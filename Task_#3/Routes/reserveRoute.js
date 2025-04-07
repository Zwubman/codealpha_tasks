import mongoose from "mongoose";
import express from "express";
import {
  createReservationTable,
  bookReservation,
  cancelBookedReservation,
  deleteReserveTable,
  payForReservation,
  paymentCallback,
  getMyReservation,
} from "../Controllers/reserveController.js";
import {
  verifyToken,
  checkManagerRole,
} from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-reserve/:id", verifyToken, checkManagerRole, createReservationTable);
router.delete("/delete-reservation", verifyToken, checkManagerRole, deleteReserveTable);
router.post("/reservation", verifyToken, bookReservation);
router.post("/cancel-reservation", verifyToken, cancelBookedReservation);
router.post("/pay", verifyToken,  payForReservation);
router.get("/callback",verifyToken, paymentCallback);
router.get("/my-rservations", verifyToken, getMyReservation);

export default router;
