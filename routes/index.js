import { Router } from "express";
import authRoutes from "./authRoutes.js";
import sosRoutes from "./sosRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import floodRoutes from "./floodRoutes.js";
import evacuationRoutes from "./evacuationRoutes.js";
import locationRoutes from "./locationRoutes.js";
import weatherRoutes from "./weatherRoutes.js";
import articleRoutes from "./articleRoutes.js";
import markRoutes from "./markRoutes.js";
import userRoutes from "./userRoutes.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/sos", sosRoutes);
router.use("/user", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/floods", floodRoutes);
router.use("/evacuations", evacuationRoutes);
router.use("/location", locationRoutes);
router.use("/weather", weatherRoutes);
router.use("/article", articleRoutes);
router.use("/mark", markRoutes);

export default router;
