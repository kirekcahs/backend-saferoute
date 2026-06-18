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

export const deleteUserById = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res
      .status(400)
      .json({ message: "User ID is required in the query." });
  }

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const deleteAdminById = async (req, res) => {
  const { id } = req.query;
  try {
    const user = await Admin.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const editAdminById = async (req, res) => {
  const { id } = req.query;
  const { name, email, password, role } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Admin ID is required in the query." });
  }

  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Check if email is taken by another admin
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use." });
      }
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (password) admin.password = password;
    if (role) admin.role = role;

    await admin.save();

    res.status(200).json({
      message: "Admin updated successfully.",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};


export const getAllAdminByRole = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    const { role } = req.query;

    const [admins, totalAdminsOrRescuers] = await Promise.all([
      Admin.find({ role: role }).skip(skip).limit(limit),
      Admin.countDocuments({ role: role }),
    ]);

    const totalPages = Math.ceil(totalAdminsOrRescuers / limit);

    res.status(200).json({
      message: "OK",
      pagination: {
        totalAdminsOrRescuers,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      admins,
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const getAllAdminAndRescuers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      Admin.find({ role: { $in: ["admin", "rescuer"] } })
        .skip(skip)
        .limit(limit),
      Admin.countDocuments({ role: { $in: ["admin", "rescuer"] } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "OK",
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: results,
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find({}).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      message: "OK",
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      users,
    });
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
      { isSosEnabled: String(newValue), type: "sos_toggle" },
    );

    res.status(200).json({
      message: `SOS ${newValue ? "enabled" : "disabled"} for all residents`,
      isSosEnabled: newValue,
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const getSosAvailability = async (req, res) => {
  try {
    const total = await User.countDocuments({ role: "user" });

    if (total === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const enabledCount = await User.countDocuments({
      role: "user",
      isSosEnabled: true,
    });

    // true only if ALL users have it enabled
    const isSosEnabled = enabledCount === total;

    res.status(200).json({ isSosEnabled });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const updateFcmToken = async (req, res) => {
  const { fcmToken } = req.body;
  const userId = req.user?.userId;

  if (!fcmToken) {
    return res.status(400).json({ message: "FCM token is required" });
  }

  try {
    await User.findByIdAndUpdate(userId, { fcmToken });
    return res.status(200).json({ message: "FCM token updated" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to update FCM token", error: err.message });
  }
};

