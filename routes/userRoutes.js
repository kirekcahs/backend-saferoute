import { Router } from "express";
import {
  createAdminOrRescuerAccount,
  deleteAdminById,
  deleteUserById,
  editAdminById,
  getAllAdmin,
  getAllRescuer,
  getAllUsers,
  getSosAvailability,
  toggleAllUsersSos,
} from "../controllers/userController.js";
import protect, { adminOnly } from "../middleware/verifyToken.js";
import admin from "../config/firebase.js";
import { updateFcmToken } from "../controllers/authController.js";

const router = Router();

router.post("/createAdminAccount", protect, adminOnly, createAdminOrRescuerAccount);
router.get("/all", protect, adminOnly, getAllUsers);
router.get("/all/admin", protect, adminOnly, getAllAdmin)
router.patch("/toggleSOS", protect , adminOnly, toggleAllUsersSos)
router.get("/all/getSosAvailability", protect, getSosAvailability)
router.patch("/fcmToken", protect, updateFcmToken)
router.delete("/deleteUserById", protect, adminOnly,deleteUserById)
router.put("/editAdminById", protect, adminOnly,editAdminById)
router.delete("/deleteAdminById", protect, adminOnly, deleteAdminById)
router.get("/all/rescuer", protect, adminOnly, getAllRescuer)

export default router;
