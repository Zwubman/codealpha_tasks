import mongoose from "mongoose";
import express from "express";
import { signUp, signIn } from "../Controllers/authController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const router = express.Router();


router.post("/sign-up/:id", signUp);
router.post("/sign-in", signIn);

export default router;