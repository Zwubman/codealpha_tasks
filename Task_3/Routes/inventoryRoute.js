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

const inventoryRouter = express.Router();

inventoryRouter.post("/add-ingredient/:id",verifyToken, checkCheifRole, addInventory);
inventoryRouter.put("/update-ingredient/:id", verifyToken, checkCheifRole, updateIngredientById);
inventoryRouter.get("/all-ingredients", verifyToken, checkCheifRole, getAllIngredient);
inventoryRouter.get("/one-ingredient/:id", verifyToken, checkCheifRole, getIngredientById);
inventoryRouter.delete("/delete-ingredient/:id", verifyToken, checkCheifRole, deleteIngredientById);
inventoryRouter.post("/suplie/:id", verifyToken, checkSuplierRole, suplieIngredeints);

export default inventoryRouter;
