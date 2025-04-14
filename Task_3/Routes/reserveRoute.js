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

const reserveRouter = express.Router();

reserveRouter.post("/create-reserve/:id", verifyToken, checkManagerRole, createReservationTable);
reserveRouter.delete("/delete-reservation", verifyToken, checkManagerRole, deleteReserveTable);
reserveRouter.post("/reservation", verifyToken, bookReservation);
reserveRouter.post("/cancel-reservation", verifyToken, cancelBookedReservation);
reserveRouter.post("/pay", verifyToken,  payForReservation);
reserveRouter.get("/callback",verifyToken, paymentCallback);
reserveRouter.get("/my-rservations", verifyToken, getMyReservation);

export default reserveRouter;
