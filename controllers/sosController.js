import SosAlert from "../models/SosAlert.js";
import User from "../models/User.js";
import { sendToUser, sendToTopic } from "../helpers/fcmService.js";
import Notification from "../models/Notification.js";
import { broadcast } from "../helpers/websocket.js";

// USER SENDS SOS SIGNAL
export const sendSOS = async (req, res) => {
  const { coords, numberOfPersons, streetName, condition } = req.body;
  const userId = req.user.userId;

  try {
    // Create SOS alert in MongoDB
    const sos = await SosAlert.create({
      userId,
      coords,
      numberOfPersons,
      streetName,
      condition,
      status: "pending",
    });

    const populatedSos = await sos.populate("userId", "phone");

    // Notify all admins via FCM topic
    await sendToTopic(
      "admin_alerts",
      "New SOS Signal",
      `A resident needs help - ${condition}`,
      {
        sosId: sos._id.toString(),
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        type: "sos_alert",
      },
    );

    broadcast({ type: "sos_alert", data: populatedSos });

    res.status(201).json({
      message: "SOS signal sent successfully",
      populatedSos,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN GETS ALL SOS ALERTS
export const getAllSOS = async (req, res) => {
  try {
    const alerts = await SosAlert.find({isActive: true})
      .populate("userId", "phone age healthStatus isPWD")
      .populate("rescuerId", "name phone")
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN GETS A SINGLE SOS ALERT
export const getSingleSOS = async (req, res) => {
  const { id } = req.query;

  try {
    const alert = await SosAlert.findById(id)
      .populate("userId", "phone age healthStatus isPWD")
      .populate("rescuerId", "name phone");

    if (!alert) {
      return res.status(404).json({ message: "SOS alert not found" });
    }

    res.status(200).json({ alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN UPDATES SOS STATUS (dispatched/resolved/cancelled)
export const updateSOSStatus = async (req, res) => {
  const { id } = req.query;
  const { status, rescuerId, rescuerCoords } = req.body;

  try {
    const sos = await SosAlert.findById(id).populate("userId", "fcmToken name");

    if (!sos ) {
      return res.status(404).json({ message: "SOS alert not found" });
    }
    if (!rescuerCoords){
      return res.status(404).json({message: "Rescuer coordinates not found."})
    }

    // Update status
    sos.status = status;
    if (rescuerId) sos.rescuerId = rescuerId;
    if (status === "resolved") sos.resolvedAt = new Date();
    if (status === "responded") sos.respondedAt = new Date();
    if (status === "dispatched" && rescuerCoords) {
      sos.rescuerCoords = rescuerCoords;
    }

    await sos.save();

    // Notify resident based on status
    // if (sos.userId.fcmToken) {
    //   const messages = {
    //     dispatched: {
    //       title: "Rescuer Dispatched",
    //       body: "A rescuer has been dispatched to your location",
    //     },
    //     resolved: {
    //       title: "SOS Resolved",
    //       body: "Your SOS has been resolved. Stay safe!",
    //     },
    //     cancelled: {
    //       title: "SOS Cancelled",
    //       body: "Your SOS signal has been cancelled",
    //     },
    //   };

    //   if (messages[status]) {
    //     await sendToUser(
    //       sos.userId.fcmToken,
    //       messages[status].title,
    //       messages[status].body,
    //       {
    //         sosId: sos._id.toString(),
    //         status,
    //         type: "sos_status_update",
    //       },
    //     );
    //   }
    // }

    broadcast({
      type: "sos_status_update",
      data: { id: sos._id, status, sos },
    });

    res.status(200).json({
      message: `SOS status updated to ${status}`,
      sos,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SOS ALERTS BY STATUS
export const getSOSByStatus = async (req, res) => {
  const { status } = req.query;

  try {
    const alerts = await SosAlert.find({ status })
      .populate("userId", "name phone age healthStatus isPWD")
      .populate("rescuerId", "name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSOS = async (req, res) => {
  const { id } = req.query

  try{
    const sos = await SosAlert.findByIdAndUpdate(id,
      {isActive: false },
      { returnDocument: 'after' }
    )

    if (!sos){
      return res.status(404).json({message: "Sos alert not found."})
    }
    res.status(200).json({message: "Sos alert deleted", content: sos});
  }catch(err){
     res.status(500).json({ message: "Server error", error: err.message })
  }
}
