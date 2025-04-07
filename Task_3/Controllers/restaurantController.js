import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookie from "cookie-parser";
import bcrypt from "bcryptjs";
import Restaurant from "../Models/restaurantModel.js";

//Register new Restaurant inorder to use this system for many restaurant
export const registerRestaurant = async (req, res) => {
  try {
    const {
      restaurantName,
      restaurantPassword,
      restaurantCountry,
      restaurantEmail,
      restaurantPhone,
      restaurantAddress,
    } = req.body;

    const isRegistered = await Restaurant.findOne({ restaurantEmail });

    if (isRegistered) {
      return res
        .status(400)
        .json({ message: "Restaurant already registered." });
    }

    const hashedPassword = await bcrypt.hash(restaurantPassword, 10);

    const restaurant = await new Restaurant({
      restaurantName,
      restaurantEmail,
      restaurantPhone,
      restaurantCountry,
      restaurantAddress,
      restaurantPassword: hashedPassword,
    });

    await restaurant.save();

    res
      .status(200)
      .json({ message: "Restaurant register successfully.", restaurant });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to register restaurant.", error });
  }
};

//Restaurant log in
export const restaurantLogIn = async (req, res) => {
  try {
    const { restaurantEmail, restaurantPassword } = req.body;

    const restaurant = await Restaurant.findOne({ restaurantEmail });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const isMatch = await bcrypt.compare(
      restaurantPassword,
      restaurant.restaurantPassword
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password, please enter the correct password.",
      });
    }

    const accessToken = jwt.sign(
      {
        id: restaurant._id,
        email: restaurant.email,
      },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "30d" }
    );

    const refreshToken = jwt.sign(
      {
        restaurantId: restaurant._id,
        restaurantEmail: restaurant.restaurantEmail,
      },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: "60d" }
    );

    res.cookie("restaurantAccessToken", accessToken);
    res.cookie("restaurantRefreshToken", refreshToken);

    res
      .status(200)
      .json({ message: "Login successfully.", accessToken, refreshToken });
  } catch (error) {}
};

//Update restaurant information
export const updateRestaurant = async (req, res) => {
  try {
    const {
      restaurantName,
      restaurantPassword,
      restaurantCountry,
      restaurantEmail,
      restaurantPhone,
      restaurantAddress,
    } = req.body;

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { restaurantEmail: restaurantEmail },
      { $set: req.body },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res
        .status(404)
        .json({ message: "Restaurant not found and not updated." });
    }

    res
      .status(200)
      .json({ message: "Restaurant successfully updated.", updatedRestaurant });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to update restaurant information." });
  }
};
