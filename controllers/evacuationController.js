// controllers/evacuationController.js
import EvacuationCenter from '../models/EvacuationCenter.js'

// GET ALL EVACUATION CENTERS
export const getCenters = async (req, res) => {
  try {
    const centers = await EvacuationCenter.find({ isActive: true })
      .sort({ currentOccupancy: 1 })   // least occupied first

    res.status(200).json({ centers })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET NEAREST AVAILABLE EVACUATION CENTER
export const getNearestCenter = async (req, res) => {
  const { latitude, longitude } = req.body

  try {
    const centers = await EvacuationCenter.find({ isActive: true })

    if (!centers.length) {
      return res.status(404).json({ message: 'No active evacuation centers found' })
    }

    // Calculate distance Haversine formula
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371                          // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c                            // distance in km
    }

    // Add distance to each center and filter out full ones
    const centersWithDistance = centers
      .filter(center => center.currentOccupancy < center.capacity)
      .map(center => ({
        ...center.toObject(),
        distance: getDistance(latitude, longitude, center.latitude, center.longitude)
      }))
      .sort((a, b) => a.distance - b.distance)  // nearest first

    if (!centersWithDistance.length) {
      return res.status(404).json({ message: 'All evacuation centers are full' })
    }

    res.status(200).json({
      nearest: centersWithDistance[0],         // closest available center
      allCenters: centersWithDistance          // all centers sorted by distance
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADMIN ADDS A NEW EVACUATION CENTER
export const addCenter = async (req, res) => {
  const {
    name, latitude, longitude,
    address, capacity, facilities,
    contactPerson, contactNumber
  } = req.body

  try {
    const center = await EvacuationCenter.create({
      name, latitude, longitude,
      address, capacity, facilities,
      contactPerson, contactNumber
    })

    res.status(201).json({
      message: 'Evacuation center added',
      center
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADMIN UPDATES EVACUATION CENTER
export const updateCenter = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  try {
    const center = await EvacuationCenter.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )

    if (!center) {
      return res.status(404).json({ message: 'Evacuation center not found' })
    }

    res.status(200).json({
      message: 'Evacuation center updated',
      center
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}