import User from "../models/User.js";
import Admin from "../models/Admin.js";
import { createToken } from "../helpers/jwt.js";
import cookieOptions from "../helpers/cookieOptions.js";
import { isValidPhone, toE164 } from "../helpers/phone.js";

// REGISTER (residents only)
export const register = async (req, res) => {
  const { age, phone, password, isPWD } = req.body;
  if (!phone || !isValidPhone(phone))
  return res.status(400).json({ message: "Invalid phone number format" });
  const normalized = toE164(phone);
  try {
    // Check if user already exists
    const existing = await User.findOne({ phone });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }
    if (age < 18 || age > 59){
      return res.status(400).json({message: "Age is not allowed. Only user with 18-59 years of age can use the application."})
    }
    // Create user
    const user = await User.create({
      age,
      phone: normalized,
      password,
      isPWD,
    });

    // Create JWT
    const token = createToken({ userId: user._id, role: user.role });

    // Store JWT in HttpOnly cookie
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "Registered successfully",
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

// LOGIN (residents and admins)
export const login = async (req, res) => {
  const { phone, email, password } = req.body;

  try {
    let user = null;
    let isAdmin = false;

    // Check if admin (uses email) or resident (uses phone)
    if (email) {
      user = await Admin.findOne({ email });
      isAdmin = true;
    } else {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const token = createToken({ userId: user._id, role: user.role });

    // Store in cookie
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    let user = null;

    // Check both User and Admin collections
    user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      user = await Admin.findById(req.user.userId).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE FCM TOKEN (called when mobile app gets a new FCM token)
export const updateFcmToken = async (req, res) => {
  const { fcmToken } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { fcmToken },
      { returnDocument: 'after' },
    ).select("-password");

    res.status(200).json({
      message: "FCM token updated",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerAdminOrRescuer = async (req, res) => {
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