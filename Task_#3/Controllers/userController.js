import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../Models/userModel.js";
import Restaurant from "../Models/restaurantModel.js";

// Registers a new employee by only manager of the restauant for the  restaurant
export const registerNewEmployee = async (req, res) => {
  try {
    const { email, role, salary } = req.body;
    const userId = req.user._id;

    // Validate that both salary and role are provided
    if (!email || !salary || !role) {
      return res.status(300).json({
        message: "Employee salary, role and email is required. ",
      });
    }

    // Check if the user is already registered as an employee or not
    if (user.email == email && user.role == role && user.salary == salary) {
      return res.status(400).json({
        message: "User already registered as employee in this restaurant",
      });
    }

    // Find the user by their user ID to get their restaurant ID
    const user = await User.findOne(userId);
    const restaurantIdentification = manager.restaurantId;

    //Find a user already log in thse system to register as the new employee for these restaurant
    const employee = await User.findOne({
      email: email,
      restaurantIdentification,
    }).populate("restaurantId");

    if (!user) {
      return res.status(400).json({ message: "User has not sign Up." });
    }

    // Get the restaurant details associated with the found user
    const restaurant = user.restaurantId;
    const salaryCurrency = restaurant.currency;

    //Register user as new Employee for the restaurant of restaurant id
    const registerdEmployee = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          email,
          role,
          salary,
          salaryCurrency,
        },
      },
      { new: true }
    );

    // If no registered employee is found or updated, return an error
    if (!registerdEmployee) {
      return res
        .status(300)
        .json({ message: "User not found or not registered as Employee" });
    }

    res
      .status(200)
      .json({ message: "User regisered successfully as Employee.", employee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to register new user.", error });
  }
};

// Updates the user's password after validating current password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user._id;

    // Check the user is exist in the database by their user ID
    const user = await user.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare the current password entered by the user with the stored password in the database
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(300).json({
        message:
          "Incorrect current password, please enter the correct current password.",
      });
    }

    // Check if the new password and the confirmation password match
    if (newPassword !== confirmNewPassword) {
      return res.status(300).json({
        message: "New password don not match, please make similar.",
      });
    }

    // Hash the new password before storing it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password successfully update." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update password.", error });
  }
};

// Retrieves all employees for a specific restaurant
export const getAllEmployee = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user in the database using their user ID and populate the restaurantId field
    const user = await User.findOne({ _id: userId }).populate("restaurantId");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const restaurant = user.restaurantId;

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Ensure the user is an employee (i.e., role is not "Customer" and salary is not null)
    if (user.role !== "Customer" && user.salary !== null) {
      return res
        .status(200)
        .json({ message: `Employee for ${restaurant.restaurantName}:`, user });
    }
  } catch (error) {}
};

// Function to get an employee by their ID
export const getEmployeeById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user (employee) in the database using the userId
    const employee = await User.findOne({ _id: userId }).select(
      "firstName middleName lastName email phone role salary"
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // This checks that the user is an actual employee and not just a customer
    if (employee.role == "Customer" && employee.salary == null) {
      return res.status(401).json({
        message:
          "You try to found users not employee, please find employee by correct id.",
      });
    }

    res.status(200).json({ message: "Employee found by id:", employee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get Employee by id." });
  }
};
