import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Middleware to verify the token
export const verifyToken = async (req, res, next) => {
  
  // Check if the request has a token
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(404)
      .json({ message: "Authorization header is required." });
  }

  // Check if the token is in the correct format
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(404).json({ message: "token is not found in headers." });
  }
  try {

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {
      if (err) {
        // Check if the error is due to token expiration
        if (err.name === TokenExpiredError) {
          res
            .status(401)
            .json({ message: "Token has expired, please log in again." });
        }
        res.status(403).json({ message: "Invalid token or has expired" });
      }
      
      // Attach the decoded user information to the request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to verify the token.", error });
  }
};

// Check the role of the user is user or not
export const checkUserRole = async (req, res, next) => {
  try {
    if (req.user.role === "User") {
      return next();
    }
    return res.status(301).json({ message: "Access denied." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Credential." });
  }
};

// Check the role of the Employer is user or not
export const checkEmployerRole = async (req, res, next) => {
  try {
    if (req.user.role === "Employer") {
      return next(); 
    }
    return res.status(403).json({ message: "Access denied." }); 
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Credential." });
  }
};
