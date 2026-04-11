import { Router } from 'express'
import protect, { adminOnly } from '../middleware/verifyToken.js'
import { getCenters, getNearestCenter, addCenter, updateCenter } from '../controllers/evacuationController.js'

const router = Router()

router.get('/centers', protect, getCenters)
router.post('/nearest', protect, getNearestCenter)
router.post('/centers', protect, adminOnly, addCenter)
router.patch('/centers/:id', protect, adminOnly, updateCenter)

export default router