import mongoose from "mongoose";
import Event from "../Models/eventModel.js";

//create event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      availableSlot,
      speakers,
      agenda,
    } = req.body;
    const userId = req.user._id;
    const isExist = await Event.findOne({
      title,
      date,
      location,
      isDeleted: false,
    });

    if (isExist) {
      return res.status(400).json({ message: "The event is already exist" });
    }

    const event = await new Event({
      title,
      description,
      date,
      time,
      location,
      availableSlot,
      speakers,
      agenda: agenda.map((item) => ({
        time: item.time,
        topic: item.topic,
      })),
    });

    await event.save();
    res.status(200).json({ message: "Event created successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Event can't create." });
  }
};

// get all event that have been created
export const getAllEvent = async (req, res) => {
  try {
    const events = await Event.find({ isDeleted: false }).select(
      "title description date time location availableSlot"
    );

    //Check if there is the event or not
    if (!events) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can'n not fetch event." });
  }
};

// To veiw the detail of the event
export const viewDetails = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Check if eventId is a valid MongoDB ObjectId
    const event = await Event.findOne({
      _id: eventId,
      isDeleted: false,
    }).select("agenda speakers");

    //Check whether the event is found or not
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json(event);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't access event's detail" });
  }
};

//To update event
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      title,
      description,
      date,
      time,
      location,
      availableSlot,
      speakers,
      agenda,
    } = req.body;

    // Update the event if it exists
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, isDeleted: false },
      { $set: req.body },
      { new: true }
    );

    if (!updateEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    res
      .status(200)
      .json({ message: "Event updated successfully.", updatedEvent });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't update the event." });
  }
};

// delete event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(
      { _id: eventId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    //Check whether the event is foun or not
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't delete the event" });
  }
};

//Get a single event by id
export const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findOne({ _id: eventId, isDeleted: false });

    //Check whether the event is exist in database or not
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res
      .status(200)
      .json({ message: "Successfullly fetch event by id.", event });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't access event by id." });
  }
};


//Get the all user rigistered for specific event
export const getAllregisteredUsers = async(req, res) => {
  try{
    const eventId = req.params.id;
    const event = await Event.findOne({_id: eventId, isDeleted: false });

    if(!event){
      return res.status(404).json({message: "Event not found."})
    }
    
    const users = event.registeredUsers;
    
    res.status(200).json({message: "Users registered for this event is: ", users})
  }catch(error){
    console.log(error);
    res.status(500).json({message: "Fail to fetch all registered users for this event."})
  }
}
