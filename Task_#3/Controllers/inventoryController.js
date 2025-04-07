import mongoose from "mongoose";
import Inventory from "../Models/inventoryModel.js";
import Restaurant from "../Models/restaurantModel.js";
import User from "../Models/userModel.js";

// Adds a new inventory item to the restaurant's inventory if it doesn't already exist
export const addInventory = async (req, res) => {
  try {
    const {
      ingredientName,
      ingredientCategory,
      supliedAmount,
      availableQuantity,
      unit,
    } = req.body;

    const restaurantId = req.params.id;

    //find restaurant by id
    const restaurant = await Restaurant.findOne({ _id: restaurantId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not foun." });
    }

    // Checking if the ingredient already exists in the restaurant's inventory
    const existingInventory = await Inventory.findOne({
      ingredientName,
      restaurantId,
    });

    if (existingInventory) {
      return res.status(303).json({ message: "Inventory already added." });
    }

    // Creating a new inventory entry with the provided details
    const inventory = await new Inventory({
      ingredientName,
      ingredientCategory,
      supliedAmount,
      availableQuantity,
      unit,
      restaurantId: restaurantId,
    });

    await inventory.save();

    res
      .status(200)
      .json({ message: "Inventory is added successfully.", inventory });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to add inventory.", error });
  }
};

//Retreive all Ingredient from the database
export const getAllIngredient = async (req, res) => {
  try {
    //Find all ingredients in the database
    const ingredients = await Inventory.find();

    //Check whether the database has registered ingredients or not
    if (!ingredients) {
      return res.status(404).json({
        message: "There is not registered ingredient in inventory model.",
      });
    }

    res.status(200).json({ message: "All ingredients:", ingredients });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Fail to fetch all created ingredient.", error });
  }
};

//Retrieve specific ingredient from database  by  ingredient id
export const getIngredientById = async (req, res) => {
  try {
    const ingredientId = req.params.id;

    //find ingredient by ingredient id
    const ingredient = await Inventory.findOne({ _id: ingredientId });

    //Check whether found it or not
    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found." });
    }

    res.status(200).json(ingredient);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Fail to access ingredient by id.", error });
  }
};

//Update created ingredient
export const updateIngredientById = async (req, res) => {
  try {
    const { ingredientName, ingredientCategory, availableQuantity, unit } =
      req.body;

    const ingredientId = req.params.id;

    //find ingredient by ingredient id and update it
    const inventory = await Inventory.findOneAndUpdate(
      { _id: ingredientId },
      {
        $set: {
          ingredientName,
          ingredientCategory,
          availableQuantity,
          unit,
        },
      },
      { new: true }
    );

    //Check whether ingredient found and update successfully
    if (!inventory) {
      return res
        .status(404)
        .json({ message: "Inventory not found and Fail to update." });
    }

    res
      .status(200)
      .json({ message: "Inventory updated successfull.", inventory });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to update inventory.", error });
  }
};

//Delete created Ingredient
export const deleteIngredientById = async (req, res) => {
  try {
    const ingredientId = req.params.id;

    //find ingredient by ingredient id and delete it
    const ingredient = await Inventory.findOneAndDelete({ _id: ingredientId });

    res.status(200).json({ message: "Ingredient deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to delete ingredient by id." });
  }
};

// Supplies ingredients into inventory stock when the available quantity is below 15% of the supplied amount
export const suplieIngredeints = async (req, res) => {
  try {
    const { supliedAmount } = req.body;

    const userId = req.user._id;
    const ingredientId = req.params.id;

    const user = await User.findOne(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    //find ingredient by ingredient id
    const ingredient = await Inventory.findOne({ _id: ingredientId });

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found. " });
    }

    // Checks if the available quantity is less than or equal to 15% of the supplied amount
    if (ingredient.availableQuantity <= 0.15 * ingredient.supliedAmount) {
      ingredient.supliedAmount = supliedAmount;
      ingredient.availableQuantity += supliedAmount;

      // Logs the supplied information with the user's details
      ingredient.supliedInfo.push({
        supleidBy: userId,
        amount: supliedAmount,
        supliedDate: new Date(),
      });
    } else {
      return res
        .status(303)
        .json({ message: "Ingredient not need supliment now." });
    }

    await ingredient.save();

    res
      .status(200)
      .json({ message: "Successfully suplied ingredients into stock." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Fail to suplie ingredients into inventory stock" });
  }
};
