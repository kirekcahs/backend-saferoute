// passwordResetController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateOtp, saveOtp, verifyOtp, deleteOtp } from "../helpers/otp.js";
import { sendSms } from "../helpers/sms.js";
import { isValidPhone, toE164 } from "../helpers/phone.js";

const GENERIC_MSG = "If that number is registered, an OTP has been sent";

export const forgotPassword = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number is required" });
  if (!isValidPhone(phone)) return res.status(400).json({ message: "Invalid phone number format" });

  // Normalize early
  const normalized = toE164(phone);

  try {
    const user = await User.findOne({ phone: normalized });
    if (!user) return res.status(200).json({ message: GENERIC_MSG });

    const otp = generateOtp();
    await saveOtp(normalized, otp); // awaited
    await sendSms(normalized, `Your SafeRoute password reset code is: ${otp}. It expires in 10 minutes. Do not share this with anyone.`);

    res.status(200).json({ message: GENERIC_MSG });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." }); 
  }
};

export const verifyResetOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required" });
  if (!isValidPhone(phone)) return res.status(400).json({ message: "Invalid phone number format" });

  const normalized = toE164(phone);
  const result = verifyOtp(normalized, otp);
  if (!result.valid) return res.status(400).json({ message: result.reason });

  // Invalidate the used OTP so it can't be replayed
  await deleteOtp(normalized);

  // Mark phone as verified for the reset step
  await saveOtp(`verified:${normalized}`, "true");

  res.status(200).json({ message: "OTP verified. You may now reset your password." });
};

export const resetPassword = async (req, res) => {
  const { phone, newPassword, confirmPassword } = req.body;
  if (!phone || !newPassword || !confirmPassword)
    return res.status(400).json({ message: "All fields are required" });
  if (!isValidPhone(phone))
    return res.status(400).json({ message: "Invalid phone number format" });
  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });
  if (newPassword.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  const normalized = toE164(phone);
  const result = verifyOtp(`verified:${normalized}`, "true");
  if (!result.valid)
    return res.status(403).json({ message: "OTP not verified or session expired. Please start over." });

  try {
    const user = await User.findOne({ phone: normalized });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash before saving (in case your pre-save hook doesn't cover direct assignment)
    user.password = newPassword;
    await user.save();

    // Invalidate the verified session so it can't be reused
    await deleteOtp(`verified:${normalized}`);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};