import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateFcmToken,
  registerAdminOrRescuer,
} from "../controllers/authController.js";
import { forgotPassword, verifyResetOtp, resetPassword } from "../controllers/passwordResetController.js"
import protect, { adminOnly } from "../middleware/verifyToken.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/fcm-token", protect, updateFcmToken);
router.post("/register-admin", adminOnly, registerAdminOrRescuer);
router.post("/forgot-password", forgotPassword);   
router.post("/verify-otp", verifyResetOtp);       
router.post("/reset-password", resetPassword);     
export default router;
