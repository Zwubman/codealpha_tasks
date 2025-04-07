import mongoose, { mongo } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const reserveSchema = mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
    },
    guestCount: {
      type: Number,
      min: 1,
    },
    prepaymentAmount: {
      type: Number,
      required: true,
      default: 500,
    },
    reservedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        customerName: {
          type: String,
        },
        customerPhone: {
          type: String,
        },
        reservationStartDateTime: {
          type: Date,
        },
        reservationEndDateTime: {
          type: Date,
        },
        reservationStatus: {
          type: String,
          enum: ["Pending", "Confirmed", "Canceled", "Completed"],
          default: "Pending",
          required: true
        },
        paymentMethod: {
          type: String,
          enum: ["Telebirr", "CBE"],
        },
        paymentStatus: {
          type: String,
          enum: ["Pending", "Paid", "Failed"],
          default: "Pending",
          required: true,
        },
        amountPaid: {
          type: String,
        },
        transactionId: {
          type: String,
        },
        tx_ref: {
          type: String,
        },
        paymentDate: {
          type: Date
        }
      },
    ],
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  },
  { timestamps: true }
);

reserveSchema.index(
  { tableNumber: 1, reservationDateTime: 1 },
  { unique: true }
);

const Reserve = mongoose.model("Reserve", reserveSchema);
export default Reserve;
