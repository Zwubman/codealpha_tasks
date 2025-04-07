import mongoose from "mongoose";
import setCurrency from "../Helpers/serCurrency.js";

const restaurantSchema = mongoose.Schema({
  restaurantName: {
    type: String,
    required: true,
    unique: true,
  },
  restaurantPassword: {
    type: String,
    required: true,
  },
  restaurantCountry: {
    type: String,
    required: true,
    enum: ["Ethiopia", "USA", "Canada", "Mexico", "China", "Japan"],
  },
  restaurantEmail: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i,
      "Please enter a valid email address.",
    ],
  },
  restaurantPhone: {
    type: String,
    required: true,
  },
  restaurantAddress: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    enum: ["ETB", "USD", "CAD", "MXN", "CNY", "JPY"],
  },
});

// Use the helper function to set currency before saving
restaurantSchema.pre("save", setCurrency);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
