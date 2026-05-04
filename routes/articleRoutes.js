import { Router } from "express";
import {
  createArticle,
  getAllArticles,
  deleteSingleArticle,
  deleteAllArticle,
} from "../controllers/articleController.js";
import protect, { adminOnly } from "../middleware/verifyToken.js";

const router = Router();

router.get("/", getAllArticles);
router.post("/createArticle", protect, adminOnly, createArticle);
router.delete("/deleteSingleArticle", protect, adminOnly, deleteSingleArticle);
router.delete("/deleteAllArticle", protect, adminOnly, deleteAllArticle);

export default router;
