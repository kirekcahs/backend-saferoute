import Location from '../models/Location.js'

// Mobile app continuously calls this to update coordinates
export const updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body
  const userId = req.user.userId   // from JWT

  try {
    // Update if exists, create if not
    const location = await Location.findOneAndUpdate(
      { userId },
      {
        userId,
        latitude,
        longitude,
        updatedAt: new Date()
      },
      { upsert: true, new: true }  // update or insert
    )

    res.status(200).json({
      message: 'Location updated',
      location: {
        userId: location.userId,
        latitude: location.latitude,
        longitude: location.longitude,
        updatedAt: location.updatedAt
      }
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Admin dashboard gets ALL resident locations to display on map
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().populate('userId', 'name phone role')

    res.status(200).json({ locations })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get a specific user's last known location
export const getUserLocation = async (req, res) => {
  const { userId } = req.params

  try {
    const location = await Location.findOne({ userId })
    if (!location) {
      return res.status(404).json({ message: 'Location not found' })
    }

    res.status(200).json({ location })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}