// routes/floodRoutes.js
import { Router } from 'express'
import protect, { adminOnly } from '../middleware/verifyToken.js'
import { submitReport, getAllReports, getVerifiedReports, verifyReport } from '../controllers/floodController.js'
import multer from 'multer'
const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/report',protect, upload.single('image'), submitReport)
router.get('/reports', protect, getAllReports)
router.get('/reports/verified', protect, getVerifiedReports)
router.patch('/:id/verify', protect, adminOnly, verifyReport)

export default router