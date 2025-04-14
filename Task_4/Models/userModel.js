import mongoose from "mongoose";

// Define the user schema
const usersSchema = mongoose.Schema(
  {
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
      unique: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Employer", "User"],
      default: "User",
      required: true,
    },
    bio: {
      type: String,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    experience: [
      {
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],

    education: [
      {
        degree: String,
        institution: String,
        startYear: Number,
        endYear: Number,
      },
    ],

    skills: [String],

    companyName: {
      type: String,
    },

    companyDescription: {
      type: String,
    },
    myApplications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    myJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  { timestamps: true }
);
const User = mongoose.model("User", usersSchema);
export default User;
