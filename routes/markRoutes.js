import { Router } from 'express'
import protect, {adminOnly} from '../middleware/verifyToken.js'
import { createPinFlood, getAllPinned, createSegment } from '../controllers/markController.js'

const router =  Router()

router.post('/createPin', protect, adminOnly, createPinFlood)
router.get('/pin', protect, getAllPinned)
router.post('/createSegment', protect, adminOnly, createSegment)
export default router