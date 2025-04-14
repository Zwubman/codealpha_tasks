import mongoose from "mongoose";
import cookie from "cookie-parser";
import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import Restaurant from "../Models/restaurantModel.js";


//Middleware to check if the user is authenticated
export const verifyToken = async (req, res, next) => {

  //Check if the token is present in the request
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Authorization header is required." });
  }

  //Check if the token is in the correct format
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "Token not found." });
  }

  try {
    //Verify the token using the secret key
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, async (err, decoded) => {
      if (err) {
        //Handle token verification errors
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ message: "Token has expired, please log in again." });
        }
        return res.status(403).json({ message: "Invalid token." });
      }

      // **Check if the token belongs to a User or a Restaurant**
      const user = await User.findById(decoded.id);
      const restaurant = await Restaurant.findById(decoded.id);

      //select which information is send by the token restaurant or user
      if (user) {
        req.user = user;
        req.userType = "User";
      } else if (restaurant) {
        req.restaurant = restaurant;
        req.userType = "Restaurant";
      } else {
        return res
          .status(404)
          .json({ message: "User or Restaurant not found." });
      }

      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify the token." });
  }
};

//Check the role of the user is Admin or not and give the access to the user
export const checkAdminRole = async (req, res, next) => {
  try {
    if (req.user.role === "Admin") {
      return next();
    }
    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid credentail." });
  }
};

//Check the role of the user is Chef or not and give the access to the user
export const checkChefRole = async (req, res, next) => {
  try {
    if (req.user.role === "Chef") {
      return next();
    }
    return res.status(403).json({ message: "Access denied." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Credential." });
  }
};

//Check the role of the user is Manager or not and give the access to the user
export const checkManagerRole = async (req, res, next) => {
  try {
    if (req.user.role === "Manager") {
      return next();
    }
    return res.status(403).json({ messag: "Access denied." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Credential.", error });
  }
};

//Check the role of the user is Cashier or not and give the access to the user
export const checkCashierRole = async (req, res, next) => {
  try {
    if (req.user.role === "Cashier") {
      return next();
    }
    return res.status(403).json({ message: "Access denied." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Credential.", error });
  }
};

//Check the role of the user is Waiter or not and give the access to the user
export const checkWaiterRole = async (req, res, next) => {
  try {
    if (req.user.role === "Waiter") {
      return next();
    }
    return res.status(403).json({ message: "Access denied." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Credential.", error });
  }
};

//Check the role of the user is Chief or not and give the access to the user
export const checkCheifRole = async (req, res, next) => {
  try {
    if (req.user.role === "Cheif") {
      return next();
    }
    return res.status(403).josn({ messsage: "Access deneid." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Credential.", error });
  }
};

//Check the role of the user is Suplier or not and give the access to the user
export const checkSuplierRole = async (req, res, next) => {
  try {
    if (req.user.role === "Suplier") {
      return next();
    }
    return res.status(403).josn({ messsage: "Access deneid." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Credential.", error });
  }
};
