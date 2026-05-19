import { Router } from "express";
import {
  createAdminAccount,
  getAllAdmin,
  getAllUsers,
  toggleAllUsersSos,
} from "../controllers/userController.js";
import protect, { adminOnly } from "../middleware/verifyToken.js";
import admin from "../config/firebase.js";

const router = Router();

router.post("/createAdminAccount", protect, adminOnly, createAdminAccount);
router.get("/all", protect, adminOnly, getAllUsers);
router.get("/all/admin", protect, adminOnly, getAllAdmin)
router.patch("/toggleSOS", protect , adminOnly, toggleAllUsersSos)

export default router;
