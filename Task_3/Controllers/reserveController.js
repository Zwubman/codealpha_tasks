import mongoose from "mongoose";
import Reserve from "../Models/reserveModel.js";
import Restaurant from "../Models/restaurantModel.js";
import User from "../Models/userModel.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import {
  sendEmailNotification,
  sendPaymentMailNotification,
} from "../Helpers/sendMail.js";

dotenv.config();

// Creates a reservation table for a specific restaurant if it doesn't already exist
export const createReservationTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;
    const restaurantId = req.params.id;

    // Checking if the restaurant exists by the given ID
    const restaurant = await Restaurant.findOne({ _id: restaurantId });
    if (!restaurant) {
      return res.status(404).json({
        message:
          "Restaurant not found in which the reservation table is created to.",
      });
    }

    // Checking if the reservation for this table already exists
    const reservation = await Reserve.findOne({ tableNumber: tableNumber });
    if (reservation) {
      return res
        .status(303)
        .json({ message: "Table reservation is already created." });
    }

    // Generate a unique transaction reference for the reservation
    const tx_ref = `reserve-${uuidv4()}`;

    // Creating a new reservation for the table
    const table = await new Reserve({
      tableNumber,
      restaurantId: restaurantId,
    });

    // Saving the new reservation to the database
    await table.save();

    res
      .status(200)
      .json({ message: "Table reservation created successfull.", table });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Fail to create Reservation table.", error });
  }
};

// Deletes a reserved table from the reservation collection
export const deleteReserveTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    //Attempting to find and delete the reserved table of table number
    const deletedTable = await Reserve.findOneAndDelete({
      tableNumber: tableNumber,
    });

    if (!deletedTable) {
      return res
        .status(404)
        .json({ message: "Reserve table not found and not deleted." });
    }

    res.status(200).json({ message: "Reserve tabel deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to delete reserve table.", error });
  }
};

// Books a reservation for a specified table in a restaurant
export const bookReservation = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      tableNumber,
      reservationStartDateTime,
      reservationEndDateTime,
    } = req.body;

    const userId = req.user._id;
    const userEmail = req.user.email;

    // Check if reservation for the specified table exists
    const reservation = await Reserve.findOne({
      tableNumber: tableNumber,
    }).populate("restaurantId");
    if (!reservation) {
      return res.status(404).json({ message: "Reserve not found." });
    }

    // Check if user for the specified user id exists
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const restaurantName = reservation.restaurantId.restaurantName;
    const reservationAmount = `${reservation.prepaymentAmount} ${reservation.restaurantId.currency}`;

    // Convert entered reservation time to a Date object
    const enteredTime = new Date(reservationStartDateTime);

    // Ensure reservation.reservedBy exists and is an array
    if (!Array.isArray(reservation.reservedBy)) {
      reservation.reservedBy = [];
    }

    // Generate a unique transaction reference for the reservation
    const tx_ref = `reserve-${uuidv4()}`;

    // Loop through reservedBy array to check all reservations
    for (const reserved of reservation.reservedBy) {
      const startTime = new Date(reserved.reservationStartDateTime);
      const endTime = new Date(reserved.reservationEndDateTime);
      const reservationStatus = reserved.reservationStatus;

      if (!reserved.tx_ref || reserved.tx_ref === null) {
        reserved.tx_ref = `reserve-${uuidv4()}`;
      }

      // If reservationStatus is confirmed and the entered time overlaps with an existing reservation, reject the booking
      if (
        reservationStatus === "Confirmed" &&
        enteredTime >= startTime &&
        enteredTime <= endTime
      ) {
        return res.status(303).json({
          message:
            "Reservation at this time is already reserved, please reserve it for another time.",
        });
      }
    }

    // Format the start and end date for email notification (e.g., "March 29, 2025")
    const dateTime1 = new Date(reservationStartDateTime);
    const dateTime2 = new Date(reservationEndDateTime);
    const startDate = dateTime1.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const endDate = dateTime2.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Format the start and end time (e.g., "12:30 PM")
    const startHours = String(dateTime1.getUTCHours()).padStart(2, "0");
    const startMinute = String(dateTime1.getUTCMinutes()).padStart(2, "0");
    const endHours = String(dateTime2.getUTCHours()).padStart(2, "0");
    const endMinute = String(dateTime2.getUTCMinutes()).padStart(2, "0");

    const amPm1 = startHours >= 12 ? "PM" : "AM";
    const amPm2 = endHours >= 12 ? "PM" : "AM";

    const startTime = `${startHours}:${startMinute} ${amPm1}`;
    const endTime = `${endHours}:${endMinute} ${amPm2}`;

    // Add the new reservation to the reservation system
    reservation.reservedBy.push({
      userId,
      customerName,
      customerPhone,
      reservationStartDateTime,
      reservationEndDateTime,
      tx_ref: tx_ref,
    });
    await reservation.save();

    // Find the specific reservation object that was added
    const reservedBy = await reservation.reservedBy.find(
      (resBy) => resBy.tx_ref === tx_ref
    );

    // Add the reservation to the user's "myReservation" list
    user.myReservation.push({
      reservationId: reservation._id,
      reservedById: reservedBy._id,
    });

    await user.save();

    //Send email notification with the following details when the user reserve reservation with the above details
    const type = "booking";
    await sendEmailNotification(
      userEmail,
      tableNumber,
      restaurantName,
      customerName,
      startDate,
      startTime,
      endDate,
      endTime,
      type,
      reservationAmount
    );

    res.status(200).json({
      message: `Reserve table number ${tableNumber} successfully booked.`,
      reservation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to booking these table.", error });
  }
};

// Cancels a previously booked reservation
export const cancelBookedReservation = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    const userId = req.user._id;
    const userEmail = req.user.email;

    //Check the user with the user id is exit
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User to cancel reservation not foun" });
    }

    // Check the reservation for the given table number is exist and populate restaurant details
    const reservation = await Reserve.findOne({
      tableNumber: tableNumber,
    }).populate("restaurantId");

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Reservation you want to cancel is not found." });
    }

    // Find the reservation entry for the specific user and ensure it is not canceled or paid
    const canceledReservation = reservation.reservedBy.find(
      (exUser) =>
        exUser.userId.toString() === userId.toString() &&
        exUser.reservationStatus !== "Canceled" &&
        exUser.paymentStatus !== "Confirmed"
    );

    if (!canceledReservation) {
      return res.status(404).json({
        message:
          "Reservation has not booked by this user, it is not in cancelable state or the payment for these reservation is paid.",
      });
    }

    // Update the reservation status to 'Canceled'
    canceledReservation.reservationStatus = "Canceled";

    const customerName = canceledReservation.customerName;
    const restaurantName = reservation.restaurantId.restaurantName;

    // Extract and format the start and end dates for the email
    const dateTime1 = new Date(canceledReservation.reservationStartDateTime);
    const dateTime2 = new Date(canceledReservation.reservationEndDateTime);
    const startDate = dateTime1.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const endDate = dateTime2.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Extract the start and end times in hours and minutes to include in the email
    const startHours = String(dateTime1.getUTCHours()).padStart(2, "0");
    const startMinute = String(dateTime1.getUTCMinutes()).padStart(2, "0");
    const endHours = String(dateTime2.getUTCHours()).padStart(2, "0");
    const endMinute = String(dateTime2.getUTCMinutes()).padStart(2, "0");

    const amPm1 = startHours >= 12 ? "PM" : "AM";
    const amPm2 = endHours >= 12 ? "PM" : "AM";

    const startTime = `${startHours}:${startMinute} ${amPm1}`;
    const endTime = `${endHours}:${endMinute} ${amPm2}`;

    // Save the updated reservation
    await reservation.save();

    // Set the email type as cancellation and send the notification when user canceled his reservation
    const type = "cancellation";
    sendEmailNotification(
      userEmail,
      restaurantName,
      tableNumber,
      customerName,
      startDate,
      startTime,
      endDate,
      endTime,
      type
    );

    res.status(200).json({ message: "Reservation is canceled successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to cancel the reservation.", error });
  }
};

// Fetches the reservations made by the logged-in user
export const getMyReservation = async (req, res) => {
  try {
    // Retrieve the user ID from the authenticated user's request
    const userId = req.user._id;

    const user = await User.findOne(userId).populate("myOrders");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User trying to get my order is not found" });
    }

    // Initialize an empty array to store the found reservations
    const foundReservations = [];

    // Loop through each reservation in the user's 'myReservation' list
    for (let reservations of user.myReservation) {
      const reservationId = reservations.reservationId;
      console.log(reservationId);

      const reservation = await Reserve.findOne({ _id: reservationId })
        .populate({
          path: "restaurantId",
          select:
            "restaurantName restaurantEmail restaurantPhone restaurantAddress", // Only select necessary fields from the restaurant
        })
        .select(
          // Select necessary fields from the 'reservedBy' array
          "tableNumber reservedBy.customerName reservedBy.customerPhone " +
            "reservedBy.reservationStartDateTime reservedBy.reservationEndDateTime " +
            "reservedBy.reservationStatus reservedBy.paymentStatus " +
            "reservedBy.paymentMethod reservedBy.amountPaid"
        );

      // If reservation is not found, log and skip to the next reservation
      if (!reservation) {
        console.log(
          `Reservation with ID ${reservationId} not found. Skipping...`
        );
        continue;
      }
      // Push the found reservation into the 'foundReservations' array
      foundReservations.push(reservation);
    }

    // If reservations are found, return them in the response
    if (foundReservations.length > 0) {
      return res
        .status(200)
        .json({ message: "My Reservations", reservations: foundReservations });
    } else {
      return res.status(404).json({ message: "No reservation is found." });
    }
  } catch (error) {
    console.log(error),
      res
        .status(500)
        .json({ message: "Fail to access my reservation.", error });
  }
};

// Handles payment initialization for a reservation
export const payForReservation = async (req, res) => {
  try {
    const { tableNumber, paymentMethod } = req.body;
    const userId = req.user._id;

    // Find the reservation by table number and user ID
    const reservation = await Reserve.findOne({
      tableNumber,
      "reservedBy.userId": userId,
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Reservation not found or not booked by this user." });
    }

    // Find the specific reservation for the user
    const reserve = reservation.reservedBy.find(
      (exUser) => exUser.userId.toString() === userId.toString()
    );

    // Get the transaction reference (tx_ref) for the reservation
    const tx_ref = reserve.tx_ref;

    // Check if the reservation is in a payable state (all reserved entries should be in "Pending" status)
    for (let reserved of reservation.reservedBy) {
      if (reserved.reservationStatus !== "Pending") {
        return res
          .status(400)
          .json({ message: "This reservation is not in  payable state." });
      }
    }

    // Get the user info for the payment process
    const user = await User.findById(userId);
    const customer = reservation.reservedBy.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (!customer) {
      return res
        .status(404)
        .json({ message: "Reservation customer not found." });
    }

    // Fix phone number format (Remove `+`)
    const phone_number = customer.customerPhone.replace("+", "");

    // Payment details
    const paymentData = {
      amount: parseFloat(reservation.prepaymentAmount),
      currency: "ETB",
      email: user.email,
      first_name: customer.customerName.split(" ")[0] || "Guest",
      last_name: customer.customerName.split(" ")[1] || "User",
      phone_number: phone_number,
      tx_ref: tx_ref,
      callback_url: `http://localhost:4444/reserve/callback?tx_ref=${encodeURIComponent(
        tx_ref
      )}`,
      return_url: `http://localhost:5173/payment-success?reservationId=${encodeURIComponent(
        reservation._id
      )}&tx_ref=${encodeURIComponent(tx_ref)}`,
      customization: {
        title: "Table Payment",
        description: `Payment for table ${reservation.tableNumber}`,
        backgroundColor: "#0000FF",
        buttonColor: "blue",
      },
    };

    // Initialize Payment with Chapa
    const chapaResponse = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // If Chapa's response status is not "success", return an error
    if (chapaResponse.data.status !== "success") {
      return res.status(500).json({
        message: "Payment initialization failed",
        details: chapaResponse.data,
      });
    }

    // const updatedreservation = await Reserve.findOneAndUpdate(
    //   {
    //     "reservedBy.tx_ref": tx_ref,
    //   },
    //   {
    //     $set: {
    //       "reservedBy.$.paymentMethod": paymentMethod,
    //     },
    //   },
    //   {
    //     new: true,
    //   }
    // );

    //Find the reservation with reservation reference tx_ref
    const updatedReserve = reservation.reservedBy.find(
      (isEX) => isEX.tx_ref.toString() === tx_ref.toString()
    );

    // If a matching reservation entry is found, update its payment method
    if (updatedReserve) {
      updatedReserve.paymentMethod = paymentMethod;

      await reservation.save();
    } else {
      console.log("No matching reservation found for tx_ref:", tx_ref);
    }

    // Respond with a success message and the payment URL from Chapa
    res.status(200).json({
      message: "Payment initialized successfully.",
      tx_ref: tx_ref,
      payment_url: chapaResponse.data.data.checkout_url,
    });
  } catch (error) {
    console.error("Chapa API Error:", error.response?.data || error);
    return res.status(500).json({
      message: "Failed to process payment.",
      chapaError: error.response?.data || error,
    });
  }
};

// Handles the callback from Chapa after a payment is processed
export const paymentCallback = async (req, res) => {
  const tx_ref = req.query.tx_ref;
  const userEmail = req.user.email;

  console.log("Raw Callback Query Params:", req.query);

  // If the transaction reference (tx_ref) is missing, return a 400 error
  if (!tx_ref) {
    return res
      .status(400)
      .json({ message: "tx_ref is required in query parameters." });
  }

  try {
    // Verify the payment status from Chapa
    const chapaResponse = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    // Extract Chapa response data
    const chapaData = chapaResponse.data;

    // If Chapa response status is not "success", return an error response
    if (!chapaData || chapaData.status !== "success") {
      return res.status(400).json({
        message: "Failed to verify payment status.",
        chapaData,
      });
    }

    // Get actual payment status and transaction reference from Chapa's verified data
    const actualStatus = chapaData.data.status;
    const transactionReference = chapaData.data.tx_ref;
    console.log("Verified Payment Status from Chapa:", actualStatus);

    // Find reservation using tx_ref
    const reservation = await Reserve.findOne({
      "reservedBy.tx_ref": tx_ref,
    }).populate("restaurantId");

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    // Find specific user information from the reservation
    const userInfo = await reservation.reservedBy.find(
      (usIn) => usIn.tx_ref === tx_ref
    );

    // If user info is not found, return a 404 error
    if (!userInfo) {
      return res
        .status(404)
        .json({ message: "Reservaion information not found." });
    }

    // Get the currency and amount paid for the reservation and restaurant name
    const currency = reservation.restaurantId.currency;
    const amountPaid = `${reservation.prepaymentAmount} ${currency}`;
    const restaurantName = reservation.restaurantId.restaurantName;

    // Update reservation status based on actual payment status
    if (actualStatus === "success") {
      // If payment is successful, update reservation status to "Paid" and "Confirmed" and other field
      const reservation = await Reserve.findOneAndUpdate(
        {
          "reservedBy.tx_ref": tx_ref,
        },
        {
          $set: {
            "reservedBy.$.paymentStatus": "Paid",
            "reservedBy.$.reservationStatus": "Confirmed",
            "reservedBy.$.transactionId": transactionReference,
            "reservedBy.$.amountPaid": amountPaid,
            "reservedBy.$.tx_ref": tx_ref,
            "reservedBy.$.paymentDate": new Date(),
          },
        },
        {
          new: true,
        }
      );

      // Send email notification to the user about the successful payment
      const type = "reservation";
      sendPaymentMailNotification(
        userEmail,
        userInfo.customerName,
        restaurantName,
        reservation.tableNumber,
        userInfo.amountPaid,
        userInfo.paymentStatus,
        type
      );
    } else {
      // If payment failed, update reservation status to "Failed" and "Pending" and other field
      const reservation = await Reserve.findOneAndUpdate(
        {
          "reservedBy.tx_ref": tx_ref,
        },
        {
          $set: {
            "reservedBy.$.paymentStatus": "Failed",
            "reservedBy.$.reservationStatus": "Pending",
            "reservedBy.$.transactionId": chapaResponse.data.data.tx_ref,
            "reservedBy.$.amountPaid": 0,
            "reservedBy.$.tx_ref": tx_ref,
            "reservedBy.$.paymentDate": new Date(),
          },
        }
      );
    }

    // Redirect user to frontend with actual status
    const redirectUrl = `http://localhost:5173/payment-success?reservationId=${reservation._id}
    &tx_ref=${tx_ref}&status=${actualStatus}`;
    res.status(200).json({
      message: "Redirecting to the success page",
      redirectUrl: redirectUrl,
    });
  } catch (error) {
    console.error("Error verifying payment with Chapa:", error);
    res.status(500).json({ message: "Server error verifying payment." });
  }
};
