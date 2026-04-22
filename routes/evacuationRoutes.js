import { Router } from 'express'
import protect, { adminOnly } from '../middleware/verifyToken.js'
import { getCenters, getNearestCenter, addCenter, updateCenter } from '../controllers/evacuationController.js'

const router = Router()

router.get('/centers', protect, getCenters)
router.post('/nearestCenter', protect, getNearestCenter)
router.post('/addCenters', protect, adminOnly, addCenter)
router.patch('/updateCenters', protect, adminOnly, updateCenter)

export default router