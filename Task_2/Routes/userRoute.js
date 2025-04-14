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

const userRouter = express.Router();

userRouter.post("/sign-up", signUp);
userRouter.post("/sign-in", signIn);
userRouter.post("/registration/:eventId", verifyToken,  userRegistration);
userRouter.post("/cancel-registration/:eventId", verifyToken,  cancelRegistration);
userRouter.get("/user-events",verifyToken,  getAllEventRegisteredTo);

export default userRouter;
