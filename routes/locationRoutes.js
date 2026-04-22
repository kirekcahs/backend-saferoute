import { Router } from 'express'
import protect, { adminOnly } from '../middleware/verifyToken.js'
import { updateLocation, getAllLocations, getUserLocation } from '../controllers/locationController.js'

const router = Router()

router.post('/updateLocations', protect, updateLocation)              // mobile app sends lat/long
router.get('/all', protect, adminOnly, getAllLocations)       // admin sees all residents on map
router.get('/userLocation', protect, getUserLocation)             // get specific user's location

export default router