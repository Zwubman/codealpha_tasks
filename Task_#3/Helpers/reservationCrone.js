import cron from "node-cron";
import Reserve from "../Models/reserveModel.js";
import User from "../Models/userModel.js";

// Cron job to cancel unpaid reservations 24 hours before their start time
cron.schedule("0 0 * * *", async () => {
  try {
    console.log(
      "Running cron job to cancel unpaid reservation before 24 hours frome stat time ......"
    );
    const currentTime = new Date();

    // Find all reservations with "Pending" status and "Unpaid" payment status
    const reservations = await Reserve.find({
      "reservedBy.reservationStatus": "Pending",
      "reservedBy.paymentStatus": { $ne: "Paid" },
    });

    // If no reservations are found, log and return
    if (reservations.length === 0) {
      console.log("No pending reservations with unpaid status found.");
      return;
    }

    // Loop through each reservation to process them
    for (let reservation of reservations) {
      // Find reservations that match the condition
      let updatedReservedBy = reservation.reservedBy.map((resBy) => {
        const reservationTime = new Date(resBy.reservationStartDateTime);

        // Calculate the remaining hours until the reservation starts
        const hoursRemaining =
          (reservationTime - currentTime) / (1000 * 60 * 60);

        // If the reservation start time is within 24 hours and still unpaid, cancel the reservation
        if (hoursRemaining <= 24) {
          resBy.reservationStatus = "Canceled";
        }

        return resBy;
      });

      // Update the document in the database
      await Reserve.updateOne(
        { _id: reservation._id },
        { $set: { reservedBy: updatedReservedBy } }
      );
    }

    console.log("Reservations updated successfully.");
  } catch (error) {
    console.error(
      "Error canceling reservations when not paid within 1 hour before the reservation start time.",
      error
    );
  }
});

// Cron job to clean up old canceled reservations that are older than 30 days
cron.schedule("0 0 * * *", async () => {
  try {
    console.log(
      "Running cron job to clean up canceled reservations older than 30 days..."
    );

    const currentTime = new Date();

    // Fetch all reservations with at least one canceled reservation entry
    const reservations = await Reserve.find({
      "reservedBy.reservationStatus": "Canceled",
    });

    let updatedCount = 0;

    // Loop through each reservation to process them
    for (let reservation of reservations) {
      // Filter out the reservedBy entries that are still valid
      const updatedReservedBy = reservation.reservedBy.filter((resBy) => {
        const reservationTime = new Date(resBy.reservationStartDateTime);

        // Calculate the difference in days between current time and reservation start time
        const daysDifference =
          (currentTime - reservationTime) / (1000 * 60 * 60 * 24);

        // If the reservation is canceled and older than 30 day, we want to remove it
        return !(
          resBy.reservationStatus === "Canceled" && daysDifference >= 30
        );
      });

      // If there were any valid reservations, process the canceled ones
      const canceledReservedByIds = reservation.reservedBy.filter(
        (resBy) =>
          resBy.reservationStatus === "Canceled" &&
          (currentTime - new Date(resBy.reservationStartDateTime)) /
            (1000 * 60 * 60 * 24) >=
            30
      );

      // Process each canceled reservation one by one
      for (let canceledRes of canceledReservedByIds) {
        const reservedId = canceledRes._id;

        // Remove the canceled reservedById from reservation's reservedBy array
        reservation.reservedBy = reservation.reservedBy.filter(
          (resBy) => resBy._id.toString() !== reservedId.toString()
        );

        // Find the user who has this reservedById in their myReservation array
        const user = await User.findOne({
          "myReservation.reservedById": reservedId,
        });

        if (user) {
          // Update the user's myReservation by removing the matching reservedById
          user.myReservation = user.myReservation.filter(
            (canceledRes) =>
              canceledRes.reservedById.toString() !== reservedId.toString()
          );

          await user.save();
          await reservation.save();
          updatedCount++;
        } else {
          console.log(`User not found for reservedById: ${reservedId}`);
        }
      }
    }

    console.log(
      `${updatedCount} reservations were updated by removing expired canceled reservations.`
    );
  } catch (error) {
    console.error("Error cleaning up old canceled reservations:", error);
  }
});
