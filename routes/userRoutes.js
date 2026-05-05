import { Router } from "express";
import {
  createAdminAccount,
  getAllAdmin,
  getAllUsers,
} from "../controllers/userController.js";
import protect, { adminOnly } from "../middleware/verifyToken.js";

const router = Router();

router.post("/createAdminAccount", protect, adminOnly, createAdminAccount);
router.get("/all", protect, adminOnly, getAllUsers);
router.get("/all/admin", protect, adminOnly, getAllAdmin)

export default router;
