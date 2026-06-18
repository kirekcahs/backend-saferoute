import { Router } from "express";
import protect, { adminOnly, adminOrRescuer } from "../middleware/verifyToken.js";
import {
  submitReport,
  getAllReports,
  getVerifiedReports,
  verifyReport,
  deleteSingleFloodReport,
  getAllReportsByStatus,
} from "../controllers/floodController.js";
import multer from "multer";
import admin from "../config/firebase.js";
const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/report", protect, upload.single("image"), submitReport);
router.get("/reports", protect, adminOrRescuer, getAllReports);
router.get("/getReportsByStatus", protect, adminOrRescuer, getAllReportsByStatus)
router.get("/reports/verified", protect, getVerifiedReports);
router.patch("/verifyReports", protect, adminOnly, verifyReport);
router.delete(
  "/deleteSingleFloodReport",
  protect,
  adminOnly,
  deleteSingleFloodReport,
);
export default router;
