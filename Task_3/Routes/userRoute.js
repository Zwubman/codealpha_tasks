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

const router = express.Router();

router.post("/register-employee", verifyToken, checkManagerRole, registerNewEmployee);
router.put("/update-password/:id", verifyToken,  updatePassword);
router.get("/all-employee", verifyToken, checkManagerRole, getAllEmployee);
router.get("/employee/:id", verifyToken, checkManagerRole, getEmployeeById);

export default router;
