import mongoose from "mongoose";

// Define the job schema
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    salary: {
      type: Number,
      required: false,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
      default: "Full-time",
    },
    category: {
      type: String,
      required: false,
    },
    applicationDeadline: {
      type: Date,
      required: false,
    },
    applicants: [
      {
        applicantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        applicationDate: {
          type: Date,
          default: Date.now,
        },
        applicationStatus: {
          type: String,
          enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
          default: "Pending",
        },
        resume: {
          type: String, // URL or file path to the uploaded resume
          required: true,
        },
        additionalInfo: {
          github: String,
          linkedIn: String,
        },
      },
    ],

    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
