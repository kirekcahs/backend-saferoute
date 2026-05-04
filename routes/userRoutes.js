import { Router } from "express";
import {
  createAdminAccount,
  getAllUsers,
} from "../controllers/userController.js";
import protect, { adminOnly } from "../middleware/verifyToken.js";

const router = Router();

router.post("/createAdminAccount", protect, adminOnly, createAdminAccount);
router.get("/all", protect, adminOnly, getAllUsers);

export default router;
