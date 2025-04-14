import mongoose from "mongoose";
import Job from "../Models/jobModel.js";
import User from "../Models/userModel.js";
import fs from "fs";
import path from "path";
import { sendMailNotification } from "../Helpers/sendMail.js";

// Create a new job
export const createNewJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      skills,
      salary,
      jobType,
      category,
      applicationDeadline,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !location ||
      !skills ||
      !salary ||
      !jobType ||
      !category ||
      !applicationDeadline
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const userId = req.user.id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check the jog is exist or not
    const isExist = await Job.findOne({
      title,
      description,
      location,
      skills,
    });

    if (isExist) {
      return res.status(409).json({ message: "Job already exists." });
    }

    // Create a new job
    const job = new Job({
      title,
      description,
      location,
      skills,
      salary,
      jobType,
      category,
      applicationDeadline,
      employer: userId,
    });

    await job.save();

    // Add the job to the employer's list of jobs
    user.myJobs.push(job._id);
    await user.save();

    return res.status(201).json({ message: "Job created successfully.", job });
  } catch (error) {
    console.error("Error creating job:", error);
    return res
      .status(500)
      .json({ message: "Failed to create new job.", error });
  }
};

// Update the jpb
export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const {
      title,
      description,
      location,
      skills,
      salary,
      jobType,
      category,
      applicationDeadline,
    } = req.body;

    // Find the job and ensure it belongs to the logged-in employer
    const job = await Job.findOne({ _id: jobId, employer: userId });
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or access denied." });
    }

    // Update the job fields if provided
    if (title) job.title = title;
    if (description) job.description = description;
    if (location) job.location = location;
    if (skills) job.skills = skills;
    if (salary) job.salary = salary;
    if (jobType) job.jobType = jobType;
    if (category) job.category = category;
    if (applicationDeadline) job.applicationDeadline = applicationDeadline;

    // Save the updated job
    await job.save();

    res.status(200).json({ message: "Job updated successfully.", job });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Failed to update the job.", error });
  }
};

// Delete the job by the creater
export const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    // Find the job and ensure it belongs to the logged-in employer
    const job = await Job.findOne({ _id: jobId, employer: userId });
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or access denied." });
    }

    // Remove the job from the employer's myJobs field
    const employer = await User.findById(userId);
    if (employer) {
      const jobIndex = employer.myJobs.indexOf(jobId);
      if (jobIndex !== -1) {
        employer.myJobs.splice(jobIndex, 1);
        await employer.save();
      }
    }

    // Remove the job from all applicants' myApplications field
    for (const applicant of job.applicants) {
      const user = await User.findById(applicant.applicantId);
      if (user) {
        const applicationIndex = user.myApplications.indexOf(jobId);
        if (applicationIndex !== -1) {
          user.myApplications.splice(applicationIndex, 1);
          await user.save();
        }
      }

      // Delete the resume file if it exists
      if (applicant.resume) {
        const absolutePath = path.resolve(applicant.resume);
        try {
          fs.unlinkSync(absolutePath);
          console.log("Resume file deleted successfully:", absolutePath);
        } catch (err) {
          console.error("Error deleting resume file:", err);
        }
      }
    }

    // Delete the job
    await Job.findByIdAndDelete(jobId);

    res.status(200).json({ message: "Job deleted successfully." });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Failed to delete the job.", error });
  }
};

// Retrieve my job
export const getMyJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Check if the user is an employer
    const myJobs = await Job.find({ employer: userId });
    if (!myJobs || myJobs.length === 0) {
      return res.status(404).json({ message: "There are no jobs." });
    }
    res.status(200).json({
      message: "My jobs retrieved successfully",
      myJobs: myJobs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Fail to retrieve my jobs.", error });
  }
};

// Retrieve all jobs
export const getAllJob = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const jobs = await Job.find();
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: "There are no jobs." });
    }

    res.status(200).json({
      message: "All jobs retrieved successfully",
      jobs: jobs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve jobs.", error });
  }
};

// Filter jobs by category
export const filterJobByCategory = async (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res
      .status(400)
      .json({ message: "Category is required in query parameters." });
  }

  try {
    const jobs = await Job.find({
      category: { $regex: new RegExp(category, "i") },
    });

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ message: `No jobs found for category: ${category}` });
    }

    res.status(200).json({
      message: `Jobs filtered by category: ${category}`,
      jobs,
    });
  } catch (error) {
    console.error("Error filtering jobs by category:", error);
    res
      .status(500)
      .json({ message: "Failed to filter jobs by category.", error });
  }
};

// Aply for the job with the resume
export const applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const { github, linkedIn } = req.body;
    const resume = req.file?.path;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has already applied
    const applicant = job.applicants.find(
      (app) => app.applicantId.toString() === userId
    );

    if (applicant) {
      // If the user has already applied and has a resume, delete the old resume
      if (applicant.resume) {
        const oldResumePath = path.resolve(applicant.resume);
        try {
          fs.unlinkSync(oldResumePath);
          console.log("Old resume file deleted successfully:", oldResumePath);
        } catch (err) {
          console.error("Error deleting old resume file:", err);
          return res.status(500).json({
            message: "Failed to delete the old resume file.",
            error: err.message,
          });
        }
      }

      // Update the applicant's resume and other details
      applicant.resume = resume;
      applicant.additionalInfo = { github, linkedIn };
    } else {
      // If no resume was uploaded or the user is applying for the first time
      if (!resume) {
        return res.status(400).json({ message: "Resume file is required." });
      }

      // Add the applicant's resume and other details
      job.applicants.push({
        applicantId: userId,
        applicationDate: new Date(),
        applicationStatus: "Pending",
        resume,
        additionalInfo: {
          github,
          linkedIn,
        },
      });

      // Add the job to the user's myApplications field
      user.myApplications.push(jobId);
      await user.save();
    }

    await job.save();

    res.status(200).json({ message: "Successfully applied for the job" });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({ message: "Failed to apply for the job", error });
  }
};


// Retrieve all my applications
export const getAllMyApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId).populate("myApplications");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user has any applications
    if (!user.myApplications || user.myApplications.length === 0) {
      return res
        .status(404)
        .json({ message: "You have not applied for any jobs yet." });
    }

    // Retrieve the jobs the user has applied for
    const jobs = await Job.find({ _id: { $in: user.myApplications } });

    res.status(200).json({
      message: "Successfully retrieved all your applications.",
      applications: jobs,
    });
  } catch (error) {
    console.log("Error retrieving applications:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve all my applications.", error });
  }
};


// To track my application 
export const trackApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Check if the user has applied for the job
    const applicant = job.applicants.find(
      (app) => app.applicantId.toString() === userId
    );

    if (!applicant) {
      return res
        .status(404)
        .json({ message: "You have not applied for this job." });
    }

    // Return the application status and additional details
    res.status(200).json({
      message: "Application status retrieved successfully.",
      applicationStatus: applicant.applicationStatus,
      applicationDate: applicant.applicationDate,
      resume: applicant.resume,
      additionalInfo: applicant.additionalInfo,
    });
  } catch (error) {
    console.error("Error tracking application status:", error);
    res
      .status(500)
      .json({ message: "Failed to track application status.", error });
  }
};

// Cancel application
export const cancelApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Check if the user has applied for the job
    const applicationIndex = user.myApplications.indexOf(jobId);
    if (applicationIndex === -1) {
      return res
        .status(400)
        .json({ message: "You have not applied for this job." });
    }

    // Remove the job from the user's myApplications field
    user.myApplications.splice(applicationIndex, 1);
    await user.save();

    // Remove the user from the job's applicants field
    const applicantIndex = job.applicants.findIndex(
      (applicant) => applicant.applicantId.toString() === userId
    );
    if (applicantIndex !== -1) {
      // Get the resume path before removing the applicant
      const resumePath = job.applicants[applicantIndex].resume;

      // Remove the applicant from the job's applicants field
      job.applicants.splice(applicantIndex, 1);
      await job.save();

      // Delete the resume file from the directory
      if (resumePath) {
        const absolutePath = path.resolve(resumePath);
        fs.unlink(absolutePath, (err) => {
          if (err) {
            console.error("Error deleting resume file:", err);
          } else {
            console.log("Resume file deleted successfully:", absolutePath);
          }
        });
      }
    }

    res.status(200).json({ message: "Application successfully canceled." });
  } catch (error) {
    console.error("Error canceling application:", error);
    res
      .status(500)
      .json({ message: "Failed to cancel the application.", error });
  }
};

// Retrieve all applicants
export const viewApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const job = await Job.findOne({ _id: jobId, employer: userId });
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Get the details of each applicant for the job
    const applicants = await Promise.all(
      job.applicants.map(async (applicant) => {
        const user = await User.findById(applicant.applicantId);
        if (!user) {
          return { message: "Applicant not found" };
        }

        applicant.applicationStatus = "Reviewed";
        await job.save();

        // Return the applicant's details along with the application status and resume
        return {
          applicantId: applicant.applicantId,
          applicantName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          applicationDate: applicant.applicationDate,
          resume: applicant.resume,
          additionalInfo: applicant.additionalInfo,
        };
      })
    );

    res.status(200).json({ applicants });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Failed to fetch applicants.", error });
  }
};

// Response for the application of the applicants (Accept or Reject)
export const responseForApplication = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const { applicantId, response } = req.body;

    // Check if the status is valid
    if (!["Accepted", "Rejected"].includes(response)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'Accepted' or 'Rejected'." });
    }

    // Check if the job exists and belongs to the employer
    const job = await Job.findOne({ _id: jobId, employer: userId });
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Check if the employer exists
    const employer = await User.findById(userId);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found." });
    }

    // Check if the applicant exists
    const applicant = await User.findById(applicantId);
    if (!applicant) {
      return res
        .status(404)
        .json({ message: "Applicant information is not found." });
    }

    // Find the applicant in the job's applicants list
    const applicantIndex = job.applicants.findIndex(
      (applicant) => applicant.applicantId.toString() === applicantId
    );

    // If the applicant is not found in the job's applicants list
    if (applicantIndex === -1) {
      return res
        .status(404)
        .json({ message: "Applicant not found in this job's applicants." });
    }

    // Check the current application status
    const currentStatus = job.applicants[applicantIndex].applicationStatus;

    if (currentStatus === "Accepted") {
      return res.status(400).json({
        message:
          "The applicant has already been accepted. You cannot change the status to 'Rejected'.",
      });
    }

    // Update the application status to "Accepted" or "Rejected"
    job.applicants[applicantIndex].applicationStatus = response;

    await job.save();

    // Send email notification
    const type = response;
    await sendMailNotification(
      applicant.email,
      applicant.firstName,
      applicant.middleName,
      applicant.lastName,
      job.title,
      employer.companyName,
      type
    );

    return res.status(200).json({
      message: `Application status updated to ${response} for the applicant.`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Response is not sending for the user.", error });
  }
};
