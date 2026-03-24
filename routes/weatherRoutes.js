// routes/weatherRoutes.js
import { Router } from 'express'
import protect from '../middleware/verifyToken.js'
import { getWeather } from '../controllers/weatherController.js'

const router = Router()

router.post('/current', protect, getWeather)   // client sends lat/long, gets weather back

export default router