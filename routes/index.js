import { Router } from 'express'
import authRoutes from './authRoutes.js'
import sosRoutes from './sosRoutes.js'
import notificationRoutes from './notificationRoutes.js'
import floodRoutes from './floodRoutes.js'
import evacuationRoutes from './evacuationRoutes.js'
import locationRoutes from './locationRoutes.js'
import weatherRoutes from './weatherRoutes.js'
import articleRoutes from './articleRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/sos', sosRoutes)
router.use('/notifications', notificationRoutes)
router.use('/floods', floodRoutes)
router.use('/evacuations', evacuationRoutes)
router.use('/location', locationRoutes)
router.use('/weather', weatherRoutes)
router.use('/article', articleRoutes)

export default router