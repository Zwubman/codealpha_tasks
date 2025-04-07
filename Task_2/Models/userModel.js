import mongoose from "mongoose";

//Create an User model
const userSchema = mongoose.Schema({
  firstName: {
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
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User",
    required: true,
  },
  phone: {
    type: String,
    allowNull: true,
  },
  registerdToEvents: [
    {
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
      title: {
        type: String,
      },
      location: {
        type: String,
      },
      date: {
        type: Date,
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);
export default User;
