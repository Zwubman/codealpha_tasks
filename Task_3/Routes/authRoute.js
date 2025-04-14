import mongoose from "mongoose";
import express from "express";
import { signUp, signIn } from "../Controllers/authController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const authRouter = express.Router();


authRouter.post("/sign-up/:id", signUp);
authRouter.post("/sign-in", signIn);

export default authRouter;