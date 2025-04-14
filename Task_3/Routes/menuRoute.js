import mongoose from "mongoose";
import express from "express";
import {
  addMenuItem,
  updateMenuItem,
  addIngredientsToItem,
  removeIngredeintFromItem,
  deleteMenuItemById,
  makeAvailableItem,
  getAllMenuItem,
} from "../Controllers/menuController.js";
import {
  checkCheifRole,
  verifyToken,
  checkChefRole,
} from "../Middlewares/authMiddleware.js";

const menuRouter = express.Router();


menuRouter.post("/add-item/:id", verifyToken, checkCheifRole, addMenuItem);
menuRouter.post("/add-ingredients/:id", verifyToken, checkChefRole, addIngredientsToItem);
menuRouter.delete("/remove-ingredient/:id", verifyToken, checkChefRole, removeIngredeintFromItem);
menuRouter.delete("/make-unavailable/:id", verifyToken, checkChefRole, deleteMenuItemById);
menuRouter.post("/make-available/:id", verifyToken, checkChefRole,  makeAvailableItem);
menuRouter.put("/update-item/:id", verifyToken, checkChefRole,  updateMenuItem);
menuRouter.get("/all-items", verifyToken, checkChefRole, getAllMenuItem);

export default menuRouter;
