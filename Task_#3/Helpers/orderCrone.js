import cron from "node-cron";
import Order from "../Models/orderModel.js";
import User from "../Models/userModel.js";

//Cancel the order when the payment is not payed and order status is confirmed with in 90 minute
cron.schedule("0 * * * *", async () => {
  console.log("Running cron job to cancel unpaid orders...");

  try {
    const currentTime = new Date();

    // Find orders that are "Pending" and have payment status not "Paid"
    const orders = await Order.find({
      "orderedBy.orderStatus": "Pending",
      "orderedBy.payment.paymentStatus": { $ne: "Paid" },
    });

    for (let order of orders) {
      const orderTime = order.orderedBy[0].orderDateTime;

      // Calculate the timeDifferenceference between current time and the order's time
      const timeDifference = currentTime - new Date(orderTime);
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));

      console.log(`Order placed at: ${orderTime}`);
      console.log(`Time time differenceference: ${minutes} minute(s)`);

      // If the order was placed more than or equal to 90 minute ago, cancel the order
      if (hours >= 6) {
        await Order.updateMany(
          { _id: order._id },
          {
            $set: {
              "orderedBy.$[].orderStatus": "Canceled",
              "orderedBy.$[].payment.paymentStatus": "Canceled",
            },
          }
        );

        console.log(`Order with ID ${order._id} has been canceled.`);
      }
    }
  } catch (error) {
    console.error("Error canceling unpaid orders:", error);
  }
});

// Schedule the cron job to run on the 1st of every month at midnight to delete upaid order and older than 1 month
cron.schedule("0 0 1 */1 *", async () => {
  console.log(
    "Running cron job to delete canceled orders older than 30 days..."
  );

  try {
    const currentTime = new Date();

    // Find orders that are "Canceled" and payment is "Canceled"
    const orders = await Order.find({
      "orderedBy.orderStatus": "Canceled",
      "orderedBy.payment.paymentStatus": "Canceled",
    });

    let deletedCount = 0;

    // Loop through each order
    for (const order of orders) {
      const orderTime = new Date(order.orderedBy[0].orderDateTime);

      // Calculate the time difference in days
      const timeDifference = currentTime - orderTime;
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));

      // If the order is older than or equal to 30 days, proceed with deletion
      if (days >= 30) {
        const user = await User.findOne({ myOrders: order._id });

        if (user) {
          // Remove the order from the user's 'myOrders' array
          user.myOrders = await user.myOrders.filter(
            (canceledOrder) => canceledOrder.toString() !== order._id.toString()
          );

          await user.save();

          // Delete the order from the 'Order' collection
          await Order.deleteOne({ _id: order._id });
          deletedCount++;
        }
      }
    }

    console.log(`Deleted ${deletedCount} canceled orders older than 30 days.`);
  } catch (error) {
    console.error("Error deleting canceled orders older than 30 days:", error);
  }
});
