import mongoose from "mongoose";

const inventorySchema = mongoose.Schema({
  ingredientName: {
    type: String,
    required: true,
  },
  supliedAmount: {
    type: Number,
    required: true,
  },
  availableQuantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ["g", "ml", "pieces"],
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
  supliedInfo: [
    {
      supleidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      amount: {
        type: Number,
      },
      supliedDate: {
        type: Date,
      },
    },
  ],
});

// Ensure ingredientName is unique per restaurant
inventorySchema.index({ ingredientName: 1, restaurantId: 1 }, { unique: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
