import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookie from "cookie-parser";
import bcrypt from "bcryptjs";
import User from "../Models/userModel.js";
import Event from "../Models/eventModel.js";
import { sendRegistrationEmail } from "../Helpers/sendMail.js";

// User sign up function
export const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const isExist = await User.findOne({ email: email });

    //Hash the password for privacy
    const hashedPassword = await bcrypt.hash(password, 10);
    if (isExist) {
      res.status(400).json({ message: "User already exist" });
    }

    //Create new user
    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      role: role,
    });

    await user.save();
    res.status(200).json({ message: "User signUp successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

// User sign in
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    //Check whether the user is exist or not
    if (!user) {
      res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentail" });
    }

    //Generate access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2h" }
    );

    //Generate refresh token
    const refreshToken = jwt.sign(
      { email: email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    //Store token in cookie
    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.json({ message: "Log In successfully.", accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can not log in." });
  }
};

//User Register for the event
export const userRegistration = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;
    const eventId = req.params.eventId;
    const userEmail = req.user.email;

    const event = await Event.findOne({ _id: eventId, isDeleted: false });
    const users = await User.findOne({ email: userEmail });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    //Check the capacity of the event is full or not
    const capacity = event.availableSlot;
    const numberOfRegisterd = event.registeredUsers.length;
    if (numberOfRegisterd >= capacity) {
      return res.status(401).json({
        message: "Registration failed. No available slots for this event.",
      });
    }

    // Check if the user is already registered for the event based on email
    const isRegistered = event.registeredUsers.some(
      (regUser) => regUser.email === userEmail
    );

    if (isRegistered) {
      return res
        .status(400)
        .json({ message: "User is already registered for this event" });
    }

    //Register user for event
    event.registeredUsers.push({
      firstName,
      lastName,
      email,
      phone,
    });

    //Store the event in which the user registered
    users.registerdToEvents.push({
      eventId,
      title: event.title,
      location: event.location,
      date: event.date,
    });

    //Save the registration
    await event.save();
    await users.save();

    //Send email notification
    await sendRegistrationEmail(
      userEmail,
      event.title,
      event.date,
      event.location
    );

    res.status(200).json({
      message:
        "User has been successfully registered for this event and will receive a notification via email.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Registration fail." });
  }
};

//Cancel registration for event
export const cancelRegistration = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userEmail = req.user.email;

    const event = await Event.findOne({ _id: eventId, isDeleted: false });
    console.log(event);
    const users = await User.findOne({ email: userEmail });
    console.log(users);

    if (!event) {
      res.status(404).json({ message: "Event not found" });
    }

    const isRegistered = event.registeredUsers.some(
      (regUser) => regUser.email === userEmail
    );

    if (!isRegistered) {
      return res
        .status(404)
        .json({ message: "User is not registered for this event." });
    }

    // Remove the user from event's registeredUsers
    event.registeredUsers = event.registeredUsers.filter(
      (regUser) => regUser.email !== userEmail
    );

    // Remove the event from user's registered events
    users.registerdToEvents = users.registerdToEvents.filter(
      (regUser) => regUser.eventId.toString() !== eventId
    );

    await event.save();
    await users.save();

    res.status(200).json({
      message: "Registration for this event is canceled successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Registration fail." });
  }
};

//To get all the event I have been registered for it
export const getAllEventRegisteredTo = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    //get allevents 
    const events = user.registerdToEvents;

    res
      .status(200)
      .json({
        message: "Event that you have been registered for it is:",
        events,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Fail to fetch all event in which you have been registered.",
    });
  }
};
