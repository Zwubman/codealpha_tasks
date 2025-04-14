import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookie from "cookie-parser";
import dotenv from "dotenv";
import User from "../Models/userModel.js";
import fs from "fs";
import path from "path";

dotenv.config();

//Sign Up
export const signUp = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      role,
      phone,
      companyName,
      companyDescription,
    } = req.body;

    if (
      !firstName ||
      !middleName ||
      !lastName ||
      !email ||
      !password ||
      !phone
    ) {
      return res
        .status(303)
        .json({ message: "all the field is required please enter." });
    }

    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(401).json({
        message: "User already registered or sign up, please sign in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "Employer") {
      if (!companyName || !companyDescription) {
        return res
          .status(303)
          .json({ message: "company name and description is required" });
      }
      const user = new User({
        firstName,
        middleName,
        lastName,
        email,
        password: hashedPassword,
        role,
        phone,
        companyName,
        companyDescription,
      });

      await user.save();

      res.status(200).json({ message: "User registered successfully.", user });
    } else {
      const user = new User({
        firstName,
        middleName,
        lastName,
        email,
        password: hashedPassword,
        role,
        phone,
      });

      await user.save();

      res.status(200).json({ message: "User registered successfully.", user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to sign up.", error });
  }
};

//Sign in
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(401)
        .json({ message: "Both email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not sign up, please sign up first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(303).json({
        message: "Incorrect password, please enter the correct password.",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_KEY,
      {
        expiresIn: "1d",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.REFRESH_TOKEN_KEY,
      {
        expiresIn: "30d",
      }
    );

    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken);

    res.status(200).json({
      message: "User sign in successfully.",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to sign in.", error });
  }
};

//Retrieve user by id
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User:", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to retrieve user by id.", error });
  }
};

// Uploading profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const userId = req.user.id; // Assuming user is authenticated and their ID is stored in req.user
    const profilePicPath = `/uploads/profilePicture/${req.file.filename}`;

    // Find the user to check for an existing profile picture
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If the user already has a profile picture, delete the existing file
    if (user.profilePicture) {
      const existingPicPath = path.join(
        __dirname,
        "..",
        "..",
        user.profilePicture
      );
      if (fs.existsSync(existingPicPath)) {
        fs.unlinkSync(existingPicPath);
      }
    }

    // Update user's profile with the new image path
    user.profilePicture = profilePicPath;
    await user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully.",
      profilePic: profilePicPath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error uploading profile picture.",
      error: error.message,
    });
  }
};

//Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    const userId = req.user.id;

    // Check if all required fields are provided
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res
        .status(401)
        .json({ message: "All fields are required to change password." });
    }

    // Find the user by ID
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the current password matches the stored password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    // Check if the new password is different from the current password
    if (currentPassword === newPassword) {
      return res.status(401).json({
        message: "New password must be different from current password.",
      });
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      return res
        .status(401)
        .json({ message: "New password and confirm password do not match." });
    }

    // Hash the new password and update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password successfully changed." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to change Password.", error });
  }
};

//Update profile information like bio, skills, experience, and education
export const editProfileDetails = async (req, res) => {
  try {
    const { bio } = req.body;

    const userId = req.user.id;

    
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }


    // Check if the user has a profile details and update it
    const updatedProfileDetails = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          bio,
        },
      },
      { new: true }
    );


    // Check if the profile details were updated successfully
    if (!updatedProfileDetails) {
      return res.status(404).json({
        message: "User not found or not updated user's profile details.",
      });
    }

    res.status(200).json({
      message: "User profile details is successfully updated.",
      updatedProfileDetails,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .jso({ message: "Failed to update the profile details.", error });
  }
};

// Add or remove skills from the user skills if the user wants
export const manageSkills = async (req, res) => {
  const { skills, action } = req.body;


  
  if (!Array.isArray(skills) && typeof skills !== "string") {
    return res
      .status(400)
      .json({ message: "Skills should be a string or an array of strings" });
  }

  // If skills is a single string, convert it into an array
  if (typeof skills === "string") {
    skills = [skills];
  }

  // Check if all skills are strings
  if (!skills.every((skill) => typeof skill === "string")) {
    return res.status(400).json({ message: "Each skill should be a string" });
  }

  try {
    let updatedUser;

    if (action === "add") {
      // Add unique skills to the user's skills array
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { skills: { $each: skills } } },
        { new: true }
      );
    } else if (action === "remove") {
      // Remove the specified skills from the user's skills array
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { skills: { $in: skills } } },
        { new: true }
      );
    } else {
      return res
        .status(400)
        .json({ message: 'Invalid action. Use "add" or "remove".' });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: `Skills ${action}ed successfully`, updatedUser });
  } catch (error) {
    res.status(500).json({ message: `Error ${action}ing skills`, error });
  }
};

// Add experience
export const addExperience = async (req, res) => {
  const { title, company, startDate, endDate, description } = req.body;

  // Check if all required fields are provided
  if (!title || !company || !startDate || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Check if startDate and endDate are valid dates
  if (isNaN(new Date(startDate)) || (endDate && isNaN(new Date(endDate)))) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  try {
    // Construct the experience object
    const newExperience = {
      title,
      company,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
    };

    // Find the user by ID and add the experience to the experience array
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { experience: newExperience } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Experience added successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error adding experience", error });
  }
};

// Remove experiance by experienc unique id
export const deleteExperience = async (req, res) => {
  const experienceId = req.params.id;

  if (!experienceId) {
    return res.status(400).json({ message: "Experience ID is required" });
  }

  try {
    // Remove the experience matching the experienceId from the user's experience array
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { experience: { _id: experienceId } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Experience deleted successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error deleting experience", error });
  }
};

//Update specific experience found by its id
export const updateExperience = async (req, res) => {
  const experienceId = req.params.id;
  const { title, company, startDate, endDate, description } = req.body;

  // Ensure all required fields are present
  if (!title || !company || !startDate || !endDate || !description) {
    return res.status(400).json({
      message:
        "All fields (title, company, startDate, endDate, description) are required",
    });
  }

  // Validate date formats
  if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
    return res.status(400).json({ message: "Invalid startDate format" });
  }

  try {
    // Find the user and update the specific experience
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "experience.$[elem]": {
            title,
            company,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            description,
          },
        },
      },
      {
        new: true,
        arrayFilters: [{ "elem._id": experienceId }], // Match the specific experience by its ID
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Experience updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating experience", error });
  }
};

// Add education
export const addEducation = async (req, res) => {
  const { degree, institution, startYear, endYear } = req.body;

  // Check if all required fields are provided
  if (!degree || !institution || !startYear || !endYear) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Check if the years are valid numbers
  if (isNaN(startYear) || isNaN(endYear)) {
    return res.status(400).json({ message: "Invalid year format" });
  }

  try {
    // Construct the education object
    const newEducation = {
      degree,
      institution,
      startYear,
      endYear,
    };

    // Find the user by ID and add the education to the education array
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { education: newEducation } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Education added successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error adding education", error });
  }
};

// Remove education by education unique id
export const deleteEducation = async (req, res) => {
  const educationId = req.params.id;

  if (!educationId) {
    return res.status(400).json({ message: "Education ID is required" });
  }

  try {
    // Remove the education matching the educationId from the user's education array
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { education: { _id: educationId } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Education deleted successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error deleting education", error });
  }
};

// Update specific education found by its id
export const updateEducation = async (req, res) => {
  const educationId = req.params.id;
  const { degree, institution, startYear, endYear } = req.body;

  // Ensure all required fields are present
  if (!degree || !institution || !startYear || !endYear) {
    return res.status(400).json({
      message:
        "All fields (degree, institution, startYear, endYear) are required",
    });
  }

  // Check if the years are valid numbers
  if (isNaN(startYear) || isNaN(endYear)) {
    return res.status(400).json({ message: "Invalid year format" });
  }

  try {
    // Find the user and update the specific education
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "education.$[elem]": {
            degree,
            institution,
            startYear,
            endYear,
          },
        },
      },
      {
        new: true,
        arrayFilters: [{ "elem._id": educationId }], // Match the specific education by its ID
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Education updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating education", error });
  }
};

// View user's profile
export const viewMyProfile = async (req, res) => {
  try {
    // Find the user by ID and include relevant fields (profilePicture, experience, skills, education)
    const user = await User.findById(req.user.id)
      .select("profilePicture experience skills education") 
      .exec();

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user's profile data
    res.status(200).json({
      message: "User profile retrieved successfully",
      profile: {
        profilePicture: user.profilePicture,
        experience: user.experience,
        skills: user.skills,
        education: user.education,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving profile", error });
  }
};
