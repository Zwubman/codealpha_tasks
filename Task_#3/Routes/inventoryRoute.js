import mongoose from "mongoose";
import express from "express";
import {
  addInventory,
  updateIngredientById,
  getAllIngredient,
  getIngredientById,
  deleteIngredientById,
  suplieIngredeints,
} from "../Controllers/inventoryController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import {
  checkCheifRole,
  checkSuplierRole,
} from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add-ingredient/:id",verifyToken, checkCheifRole, addInventory);
router.put("/update-ingredient/:id", verifyToken, checkCheifRole, updateIngredientById);
router.get("/all-ingredients", verifyToken, checkCheifRole, getAllIngredient);
router.get("/one-ingredient/:id", verifyToken, checkCheifRole, getIngredientById);
router.delete("/delete-ingredient/:id", verifyToken, checkCheifRole, deleteIngredientById);
router.post("/suplie/:id", verifyToken, checkSuplierRole, suplieIngredeints);

export default router;
