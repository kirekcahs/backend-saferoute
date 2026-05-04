import { Users } from "@azure/cosmos";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
export const createAdminAccount = async (req, res) => {
  try {
    const { name, email, password, department, region } = req.body;

    // Validate required fields
    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and department are required.",
      });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create the admin (password hashing handled by pre-save hook)
    const admin = await Admin.create({
      name,
      email,
      password,
      department,
      ...(region && { region }),
    });

    // Strip password from response
    const { password: _, ...adminData } = admin.toObject();

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully.",
      data: adminData,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Handle duplicate key error (race condition fallback)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getAllUsers = async (req,res) => {
    try{
      const users = await User.find({});
      res.status(200).json({message: "OK", users})
    }catch(err){
      res.status(500).json({code:500, message:"Internal Server Error"})
    }
}