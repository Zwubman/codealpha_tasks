import express from "express";
import {
  createEvent,
  getAllEvent,
  viewDetails,
  updateEvent,
  deleteEvent,
  getEventById,
  getAllregisteredUsers,
} from "../Controllers/eventController.js";
import { verifyToken, checkAdminRole } from "../Middlewares/authMiddleware.js";


const eventRouter = express.Router();

eventRouter.post("/create-event", verifyToken, checkAdminRole, createEvent);
eventRouter.put("/update-event/:eventId", verifyToken, checkAdminRole, updateEvent);
eventRouter.delete("/delete-event/:eventId",verifyToken, checkAdminRole, deleteEvent);
eventRouter.get("/get-event", verifyToken, getAllEvent);
eventRouter.get("/details/:id", verifyToken, viewDetails);
eventRouter.get("/event/:id", verifyToken, getEventById);
eventRouter.get("/registered-users/:id", getAllregisteredUsers);

export default eventRouter;
