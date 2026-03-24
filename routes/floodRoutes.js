// routes/floodRoutes.js
import { Router } from 'express'
import protect, { adminOnly } from '../middleware/verifyToken.js'
import { submitReport, getAllReports, getVerifiedReports, verifyReport } from '../controllers/floodController.js'

const router = Router()

router.post('/report', protect, submitReport)
router.get('/reports', protect, getAllReports)
router.get('/reports/verified', protect, getVerifiedReports)
router.patch('/:id/verify', protect, adminOnly, verifyReport)

export default router