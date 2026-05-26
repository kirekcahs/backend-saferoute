import { Router } from "express";
import protect, {
  adminOnly,
  adminOrRescuer,
} from "../middleware/verifyToken.js";
import {
  sendSOS,
  getAllSOS,
  getSingleSOS,
  updateSOSStatus,
  getSOSByStatus,
  deleteSOS,
  getSOSbyId,
} from "../controllers/sosController.js";

const router = Router();

router.post("/send", protect, sendSOS);
router.get("/alerts", protect, adminOrRescuer, getAllSOS);
router.get("/alerts/status", protect, adminOrRescuer, getSOSByStatus);
router.get("/singleSOS", protect, adminOrRescuer, getSingleSOS);
router.patch("/updateStatus", protect, adminOrRescuer, updateSOSStatus);
router.patch("/deleteSOS", protect, adminOnly, deleteSOS);
router.get("/getSOSbyId", protect, getSOSbyId);
export default router;
