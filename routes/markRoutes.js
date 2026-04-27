import { Router } from "express";
import protect, { adminOnly } from "../middleware/verifyToken.js";
import {
  createPinFlood,
  getAllPinned,
  createSegment,
  getAllSegments,
  deleteSingleSegment,
  deleteAllSegments,
  deleteAllPin,
  deleteSinglePin
} from "../controllers/markController.js";

const router = Router();

router.post("/createPin", protect, adminOnly, createPinFlood);
router.get("/pin/all", protect, getAllPinned);
router.post("/createSegment", protect, adminOnly, createSegment);
router.get("/segment/all", protect, getAllSegments)
router.delete("/segment/deleteSingleSegment", protect, adminOnly, deleteSingleSegment);
router.delete("/segment/deleteAllSegments", protect, adminOnly, deleteAllSegments);
router.delete("/pin/deleteSinglePin", protect, adminOnly, deleteSinglePin)
router.delete("/pin/deleteAllPins", protect, adminOnly, deleteAllPin)
export default router;
