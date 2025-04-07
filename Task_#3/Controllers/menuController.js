import mongoose, { modelNames } from "mongoose";
import Menu from "../Models/menuModel.js";
import Restaurant from "../Models/restaurantModel.js";

//Function to add a new menu item to a restaurant's menu
export const addMenuItem = async (req, res) => {
  try {
    const { menuItemName, category, price, isAvailable, ingredients } =
      req.body;

    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findOne({ _id: restaurantId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const isAdded = await Menu.findOne({ menuItemName });

    if (isAdded) {
      return res
        .status(300)
        .json({ message: "Item is already added into the menu." });
    }

    // Create a new menu item document
    const item = await new Menu({
      menuItemName,
      category,
      price,
      isAvailable,
      ingredients,
      restaurantId: restaurantId,
    });

    await item.save();

    res
      .status(200)
      .json({ message: "Item added successfully into the menu.", item });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail adding items int menu.", error });
  }
};

//Function to update a menu item by its ID
export const updateMenuItem = async (req, res) => {
  try {
    const { menuItemName, category, price } = req.body;
    const menuId = req.params.id;

    // Find the menu item by ID and update it with new values
    const item = await Menu.findOneAndUpdate(
      { _id: menuId },
      {
        $set: {
          menuItemName,
          category,
          price,
        },
      },
      { new: true } // Return the updated document
    );

    if (!item) {
      return res.status(404).json({ message: "Fail to update Item." });
    }

    res.status(200).json({ message: "Item updated successfully.", item });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to update item in menu." });
  }
};

// Function to add ingredients to a specific menu item
export const addIngredientsToItem = async (req, res) => {
  try {
    const { ingredients } = req.body;
    const itemId = req.params.id;
    const item = await Menu.findOne({ _id: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Array to collect new ingredients to be added
    const newIngredients = [];

    // Loop through the ingredients array to process each ingredient
    for (const ingredient of ingredients) {
      const { ingredientId, amountUsedPerItem } = ingredient;

      // Check if the ingredient already exists in the item's ingredients array
      const isExist = item.ingredients.some((ingMenu) => {
        return ingMenu.ingredientId.toString() === ingredientId.toString();
      });

      if (isExist) {
        continue;
      }

      // If ingredient is not present, add it to the newIngredients array
      newIngredients.push({
        ingredientId,
        amountUsedPerItem,
      });
    }

    // If there are new ingredients to add, update the item
    if (newIngredients.length > 0) {
      item.ingredients.push(...newIngredients);
      await item.save();

      return res.status(200).json({
        message: "New ingredient(s) added successfully to the menu item.",
        item,
      });
    } else {
      return res.status(400).json({
        message: "No new ingredients to add. All ingredients already exist.",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to add ingredient(s) to the menu item." });
  }
};

//Remove existing ingredient of the menu item if it is not neccessary
export const removeIngredeintFromItem = async (req, res) => {
  try {
    const { ingredientId } = req.body;
    const itemId = req.params.id;

    // Check the menu item is exist
    const item = await Menu.findOne({ _id: itemId });
    if (!item) {
      return res.status(404).json({ message: "Menu item is not found." });
    }

    // Check if the ingredient exists in the item's ingredients list
    const isExist = await item.ingredients.some((ingMenu) => {
      return ingMenu.ingredientId.toString() === ingredientId.toString();
    });

    if (!isExist) {
      return res.status(404).json({
        message: `Ingredient is not found in ${item.menuItemName} item`,
      });
    }

    // Filter out the ingredient to remove it from the list
    item.ingredients = await item.ingredients.filter((ingMenu) => {
      return ingMenu.ingredientId.toString() !== ingredientId.toString();
    });

    await item.save();

    res.status(200).json({ message: "Ingredeint removed successfully.", item });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to remove ingredient." });
  }
};

// Delete (soft delete) a menu item by marking it as unavailable
export const deleteMenuItemById = async (req, res) => {
  try {
    const itemId = req.params.id;

    const item = await Menu.findOne({ _id: itemId, isAvailable: true });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    // Mark the item as unavailable (soft delete)
    item.isAvailable = false;

    await item.save();

    res.status(200).json({ message: "Menu item deleted successfully.", item });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message });
  }
};

//Make available(undelete) the deleted menu item
export const makeAvailableItem = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const itemId = req.params.id;
    const item = await Menu.findOne({ _id: itemId });

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // Mark the item as available (undoing the soft-delete)
    item.isAvailable = true;

    await item.save();

    res.status(200).json({ message: "Item is available now.", item });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Fail to update Availablity to true.", error });
  }
};

// Get all menu items from the menu
export const getAllMenuItem = async (req, res) => {
  try {
    // Fetch all items from the Menu collection
    const items = await Menu.find();
    if (!items) {
      return res
        .status(404)
        .json({ message: "There is not menu item in the menu." });
    }

    res.status(200).json({ message: "All menu item in the menu:", items });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Fail to fetch all available items.", error });
  }
};
