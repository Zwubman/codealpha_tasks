import mongoose, { mongo } from "mongoose";
import { formatSalaryVirtual } from "../Helpers/formatHelper.js";

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  tableNumber: {
    type: String,
    allowNull: true,
  },
  reservationDateTime: {
    type: Date,
    allowNull: true,
  },
  role: {
    type: String,
    enum: ["Admin", "Cheif", "Manager", "Cashier", "Waiter", "Chef", "Suplier", "Customer"],
    default: "Customer",
    required: true,
  },
  salary: {
    type: String,
    allowNull: true,
  },
  salaryCurrency: {
    type: String,
    enum: ["ETB", "USD", "CAD", "MXN", "CNY", "JPY"],
  },
  myOrders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  myReservation: [
    {
      reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reserve",
      },
      reservedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reserve",
      },
    },
  ],
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
  },

  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
});

// Apply the virtual field logic from the helper
formatSalaryVirtual(userSchema);

const User = mongoose.model("User", userSchema);
export default User;
