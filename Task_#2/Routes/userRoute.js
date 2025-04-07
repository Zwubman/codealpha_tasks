import mongoose from "mongoose";
import express from "express";
import {
  signUp,
  signIn,
  userRegistration,
  cancelRegistration,
  getAllEventRegisteredTo,
} from "../Controllers/userController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/registration/:eventId", verifyToken,  userRegistration);
router.post("/cancel-registration/:eventId", verifyToken,  cancelRegistration);
router.get("/user-events",verifyToken,  getAllEventRegisteredTo);

export default router;
