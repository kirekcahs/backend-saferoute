import { Router } from 'express'
import protect, { adminOnly } from '../middleware/verifyToken.js'
import { broadcastFloodAlert, notifySpecificUser, getAllNotifications, sendAnnouncement } from '../controllers/notificationController.js'

const router = Router()

router.post('/flood-alert', protect, adminOnly, broadcastFloodAlert)
router.post('/notify-user', protect, adminOnly, notifySpecificUser)
router.post('/announcement', protect, adminOnly, sendAnnouncement)
router.get('/all', protect, getAllNotifications)

export default router