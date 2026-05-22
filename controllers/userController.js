import Admin from "../models/Admin.js";
import User from "../models/User.js";
import { broadcast } from "../helpers/websocket.js";
import { sendToUser, sendToTopic } from "../helpers/fcmService.js";

export const createAdminOrRescuerAccount = async (req, res) => {
  const { name, email, password, role } = req.body;

  const roleMessages = {
    admin: "Admin registered successfully.",
    rescuer: "Rescuer registered successfully.",
  };
  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await Admin.create({
      name,
      email,
      password,
      role: role || "admin",
    });

    res.status(201).json({
      message: roleMessages[role] ?? "User registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllAdmin = async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.status(200).json({ message: "OK", admins });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ message: "OK", users });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const toggleAllUsersSos = async (req, res) => {
  try {
    const anyUser = await User.findOne({ role: "user" });

    if (!anyUser) {
      return res.status(404).json({ message: "No users found" });
    }

    const newValue = !anyUser.isSosEnabled;

    await User.updateMany({ role: "user" }, { isSosEnabled: newValue });

    broadcast({
      type: "sos_toggle",
      isSosEnabled: newValue,
      message: `SOS ${newValue ? "enabled" : "disabled"} for all residents`,
    });

    // Notify all users subscribed to the "users" topic via FCM
    await sendToTopic(
      "users",
      `SOS ${newValue ? "Enabled" : "Disabled"}`,
      `SOS has been ${newValue ? "enabled" : "disabled"} for all residents.`,
      { isSosEnabled: String(newValue), type: "sos_toggle" }
    );

    res.status(200).json({
      message: `SOS ${newValue ? "enabled" : "disabled"} for all residents`,
      isSosEnabled: newValue,
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};
