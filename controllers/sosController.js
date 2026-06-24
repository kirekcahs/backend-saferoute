import SosAlert from "../models/SosAlert.js";
import User from "../models/User.js";
import { sendToUser, sendToTopic } from "../helpers/fcmService.js";
import Notification from "../models/Notification.js";
import { broadcast } from "../helpers/websocket.js";
import Admin from "../models/Admin.js";

// USER SENDS SOS SIGNAL
export const sendSOS = async (req, res) => {
  const { coords, numberOfPersons, streetName, condition } = req.body;
  const userId = req.user.userId;
  if (!numberOfPersons || !streetName || !condition){
    return res.status(400).json({message:"Input incomplete. Please complete the inputs."})
  }
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [result] = await SosAlert.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "pending"] }, then: 1 },
                { case: { $eq: ["$status", "dispatched"] }, then: 2 },
                { case: { $eq: ["$status", "responded"] }, then: 3 },
                { case: { $eq: ["$status", "resolved"] }, then: 4 },
              ],
              default: 99,
            },
          },
        },
      },
      { $sort: { statusOrder: 1, createdAt: -1 } },
      {
        $facet: {
          total: [{ $count: "count" }],
          alerts: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const totalAlerts = result.total[0]?.count || 0;
    const totalPages = Math.ceil(totalAlerts / limit);

    // Re-populate after aggregation
    const alerts = await SosAlert.populate(result.alerts, [
      { path: "userId", select: "phone age healthStatus isPWD" },
      { path: "rescuerId", select: "name phone" },
    ]);

    res.status(200).json({
      pagination: {
        totalAlerts,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      alerts,
    });
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
  const { status, rescuerId, rescuerCoords, coords } = req.body;

  try {
    const sos = await SosAlert.findById(id).populate(
      "userId",
      "fcmToken phone",
    );

    if (!sos) {
      return res.status(404).json({ message: "SOS alert not found" });
    }

    // Only demand rescuerCoords if the status is "dispatched"
    if (status === "dispatched" && !rescuerCoords) {
      return res.status(400).json({
        message: "Rescuer coordinates are required when dispatching.",
      });
    }

    // Update status and rescuer ID
    sos.status = status;
    if (rescuerId) sos.rescuerId = rescuerId;

    // Update timestamps
    if (status === "resolved") sos.resolvedAt = new Date();
    if (status === "responded") sos.respondedAt = new Date();

    // Update coordinates based on status
    if (status === "dispatched" && rescuerCoords) {
      sos.rescuerCoords = rescuerCoords;
    }

    // Update the main coords when status is "responded"
    if (status === "responded" && coords) {
      sos.coords = coords;
    }

    await sos.save();

    if (status === "dispatched" && rescuerId) {
      await Admin.findByIdAndUpdate(rescuerId, {
        $addToSet: { respondedTo: sos._id }, // addToSet prevents duplicates
      });
    }

    if (sos.userId?.fcmToken) {
      const messages = {
        dispatched: {
          title: "Rescuer on the way",
          body: "A rescuer has been dispatched to your location.",
        },
        responded: {
          title: "Rescuer arrived",
          body: "The rescuer has arrived at your location.",
        },
        resolved: {
          title: "SOS resolved",
          body: "Your SOS has been resolved. Stay safe!",
        },
        cancelled: {
          title: "SOS cancelled",
          body: "Your SOS signal has been cancelled.",
        },
      };

      if (messages[status]) {
        await sendToUser(
          sos.userId.fcmToken,
          messages[status].title,
          messages[status].body,
          {
            sosId: sos._id.toString(),
            status,
            type: "sos_status_update",
          },
        );
      }
    }

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

  // 1. Validate status existence
  if (!status) {
    return res.status(400).json({ message: "Status query parameter is required." });
  }

  // 2. Validate against allowed enums
  const allowedStatuses = ["pending", "dispatched", "responded", "resolved", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}`,
    });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 8);
    const skip = (page - 1) * limit;

    // 3. Aggregate instead of find()
    const [result] = await SosAlert.aggregate([
      // Match both the specific status and isActive
      { $match: { status: status, isActive: true } }, 
      // Sort newest first
      { $sort: { createdAt: -1 } }, 
      // Facet for pagination and counting in a single trip
      {
        $facet: {
          total: [{ $count: "count" }],
          alerts: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    // Extract total count safely
    const totalAlerts = result.total[0]?.count || 0;
    const totalPages = Math.ceil(totalAlerts / limit) || 1; // Fallback to 1 if empty

    // 4. Re-populate after aggregation to get ALL user/rescuer properties
    const alerts = await SosAlert.populate(result.alerts, [
      { path: "userId", select: "name phone age healthStatus isPWD" },
      { path: "rescuerId", select: "name phone" },
    ]);

    res.status(200).json({
      message: "OK",
      pagination: {
        totalAlerts,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      alerts,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// GET SOS ALERTS BY DEPTH (CONDITION)
export const getSosByDepth = async (req, res) => {
  const { depth } = req.query;
  const allowedDepths = ["ankle-deep", "knee-deep", "chest-deep", "critical"];
  if (!allowedDepths.includes(depth)) {
    return res.status(400).json({
      message: `Invalid depth condition. Allowed values are: ${allowedDepths.join(", ")}`,
    });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;


    const [result] = await SosAlert.aggregate([
      { $match: { condition: depth, isActive: true } }, 
      { $sort: { createdAt: -1 } }, // Sort newest alerts first
      {
        $facet: {
          total: [{ $count: "count" }],
          alerts: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);


    const totalAlerts = result.total[0]?.count || 0;
    const totalPages = Math.ceil(totalAlerts / limit) || 1;

    const alerts = await SosAlert.populate(result.alerts, [
      { path: "userId", select: "name phone age healthStatus isPWD" },
      { path: "rescuerId", select: "name phone" },
    ]);

    res.status(200).json({
      message: "OK",
      pagination: {
        totalAlerts,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      alerts,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const deleteSOS = async (req, res) => {
  const { id } = req.query;

  try {
    const sos = await SosAlert.findByIdAndUpdate(
      id,
      { isActive: false },
      { returnDocument: "after" },
    );

    if (!sos) {
      return res.status(404).json({ message: "Sos alert not found." });
    }

    await Admin.updateMany(
      { respondedTo: sos._id },
      { $pull: { respondedTo: sos._id } },
    );
    res.status(200).json({ message: "Sos alert deleted", content: sos });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getSOSbyId = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "SOS ID is required." });
  }

  try {
    const sos = await SosAlert.findOne({ _id: id, isActive: true });

    if (!sos) {
      return res
        .status(404)
        .json({ message: "SOS alert not found or is no longer active." });
    }

    return res.status(200).json({ message: "OK", sos });
  } catch (err) {
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error" });
  }
};
