import mongoose from "mongoose";
import express from "express";
import {
  registerNewEmployee,
  updatePassword,
  getAllEmployee,
  getEmployeeById,
} from "../Controllers/userController.js";
import {
  verifyToken,
  checkAdminRole,
  checkManagerRole,
} from "../Middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register-employee", verifyToken, checkManagerRole, registerNewEmployee);
userRouter.put("/update-password/:id", verifyToken,  updatePassword);
userRouter.get("/all-employee", verifyToken, checkManagerRole, getAllEmployee);
userRouter.get("/employee/:id", verifyToken, checkManagerRole, getEmployeeById);

export default userRouter;
