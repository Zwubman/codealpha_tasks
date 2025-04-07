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


const router = express.Router();

router.post("/create-event", verifyToken, checkAdminRole, createEvent);
router.put("/update-event/:eventId", verifyToken, checkAdminRole, updateEvent);
router.delete("/delete-event/:eventId",verifyToken, checkAdminRole, deleteEvent);
router.get("/get-event", verifyToken, getAllEvent);
router.get("/details/:id", verifyToken, viewDetails);
router.get("/event/:id", verifyToken, getEventById);
router.get("/registered-users/:id", getAllregisteredUsers);

export default router;
