import mongoose, { get } from "mongoose";
import express from "express";
import upload from "../Middlewares/upload.js";
import {
  createNewJob,
  getAllJob,
  filterJobByCategory,
  applyForJob,
  viewApplicants,
  responseForApplication,
  getMyJobs,
  getAllMyApplication,
  cancelApplication,
  updateJob,
  deleteJob,
  trackApplicationStatus
} from "../Controllers/jobController.js";
import {
  verifyToken,
  checkEmployerRole,
  checkUserRole,
} from "../Middlewares/authMiddleware.js";

const jobRouter = express.Router();

jobRouter.post("/create-job", verifyToken, checkEmployerRole, createNewJob);
jobRouter.get("/all-jobs", verifyToken, getAllJob);
jobRouter.get("/fillter-jobs", verifyToken, filterJobByCategory);
jobRouter.post("/apply/:id", verifyToken, checkUserRole, upload.single("resume"), applyForJob);
jobRouter.get("/all-applicants/:id", verifyToken, checkEmployerRole, viewApplicants);
jobRouter.post("/respond/:id", verifyToken, checkEmployerRole, responseForApplication);
jobRouter.get("/my-jobs", verifyToken, checkEmployerRole, getMyJobs);
jobRouter.get("/my-applications", verifyToken, checkUserRole, getAllMyApplication);
jobRouter.delete("/cancel-application/:id", verifyToken, checkUserRole, cancelApplication);
jobRouter.put("/update-job/:id", verifyToken, checkEmployerRole, updateJob);
jobRouter.delete("/delet-job/:id", verifyToken, checkEmployerRole, deleteJob);
jobRouter.get("/track-application/:id", verifyToken, checkUserRole, trackApplicationStatus);

export default jobRouter;
