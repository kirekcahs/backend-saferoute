// routes/authRoutes.js
import { Router } from 'express'
import { register, login, logout, getMe, updateFcmToken, registerAdmin } from '../controllers/authController.js'
import protect from '../middleware/verifyToken.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', protect, logout)
router.get('/me', protect, getMe)
router.patch('/fcm-token', protect, updateFcmToken)
router.post('/register-admin', registerAdmin)

export default router