import mongoose from "mongoose";
import express from "express";
import {
  signUp,
  signIn,
  getUserById,
  uploadProfilePicture,
  changePassword,
  editProfileDetails,
  manageSkills,
  addExperience,
  deleteExperience,
  updateExperience,
  addEducation,
  deleteEducation,
  updateEducation,
  viewMyProfile,
} from "../Controllers/userController.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";
import upload from "../Middlewares/upload.js";

const userRoute = express.Router();

userRoute.post("/sign-up", signUp);
userRoute.post("/sign-in", signIn);
userRoute.get("/get-user/:id", getUserById);
userRoute.post("/profile-picture", verifyToken, upload.single("profilePic"), uploadProfilePicture);
userRoute.put("/change-password", verifyToken, changePassword);
userRoute.put("/update-details", verifyToken, editProfileDetails);
userRoute.post("/manage-skills", verifyToken, manageSkills);
userRoute.post("/add-experience", verifyToken, addExperience);
userRoute.delete("/delete-experience/:id", verifyToken, deleteExperience);
userRoute.put("/update-experience/:id", verifyToken, updateExperience);
userRoute.post("/add-education", verifyToken, addEducation);
userRoute.delete("/delete-education/:id", verifyToken, deleteEducation);
userRoute.put("/update-education/:id", verifyToken, updateEducation);
userRoute.get("/my-profile", verifyToken, viewMyProfile);

export default userRoute;
