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

const router = express.Router();


router.post("/add-item/:id", verifyToken, checkCheifRole, addMenuItem);
router.post("/add-ingredients/:id", verifyToken, checkChefRole, addIngredientsToItem);
router.delete("/remove-ingredient/:id", verifyToken, checkChefRole, removeIngredeintFromItem);
router.delete("/make-unavailable/:id", verifyToken, checkChefRole, deleteMenuItemById);
router.post("/make-available/:id", verifyToken, checkChefRole,  makeAvailableItem);
router.put("/update-item/:id", verifyToken, checkChefRole,  updateMenuItem);
router.get("/all-items", verifyToken, checkChefRole, getAllMenuItem);

export default router;
