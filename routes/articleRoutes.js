import { Router } from "express";
import {
  createArticle,
  getAllArticles,
  deleteSingleArticle,
  deleteAllArticle,
} from "../controllers/articleController.js";
import protect, { adminOnly } from "../middleware/verifyToken.js";
import multer from "multer";
const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/all", getAllArticles);
router.post("/createArticle", protect, adminOnly, upload.single("image"), createArticle);
router.delete("/deleteSingleArticle", protect, adminOnly, deleteSingleArticle);
router.delete("/deleteAllArticle", protect, adminOnly, deleteAllArticle);

export default router;
