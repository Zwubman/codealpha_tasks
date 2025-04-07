import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookie from "cookie-parser";
import bcrypt from "bcryptjs";
import User from "../Models/userModel.js";

// Register a new user and associate them with a restaurant
export const signUp = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, phone, password } =
      req.body;

    const restaurantId = req.params.id;

    // Ensure all feild are provided
    if (
      !password ||
      !firstName ||
      !middleName ||
      !lastName ||
      !email ||
      !phone
    ) {
      return res.status(300).json({
        message:
          "password, firstName, middleName, lastName, email and phone are required, please enter your password.",
      });
    }

    // Check if a user with the same email already exists under the same restaurant
    const isExist = await User.findOne({
      email,
      restaurantId,
    });

    if (isExist) {
      return res
        .status(401)
        .json({ message: "User already exist please sign in." });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const user = new User({
      firstName,
      middleName,
      lastName,
      email,
      phone,
      role,
      password: hashedPassword,
      restaurantId: restaurantId,
    });

    await user.save();

    res.status(200).json({ message: "User sign up successfully.", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to sign up.", error });
  }
};

// Sign in registered user
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // If user doesn't exist, prompt them to sign up
    if (!user) {
      return res.status(404).json({
        message: "User has not sign up plaese sign up before sign in",
      });
    }

    // compare raw input password with hashed password stored in DB.
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate access token (valid for 1 day)
    const userAccessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "1d" }
    );

    // Generate refresh token (valid for 30 days)
    const userRefreshToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: "30d" }
    );

    // Store tokens as cookies in the response
    res.cookie("userAccessToken", userAccessToken);
    res.cookie("userRefreshToken", userRefreshToken);

    // Send successful login response with tokens
    res.status(200).json({
      message: "Log in successfully.",
      userAccessToken,
      userRefreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: "Fail to sign in", error });
  }
};
