// controllers/sosController.js
import SosAlert from '../models/SosAlert.js'
import User from '../models/User.js'
import { sendToUser, sendToTopic } from '../helpers/fcmService.js'
import Notification from '../models/Notification.js'

// USER SENDS SOS SIGNAL
export const sendSOS = async (req, res) => {
  const { latitude, longitude, numberOfPersons, condition } = req.body
  const userId = req.user.userId

  try {
    // Create SOS alert in MongoDB
    const sos = await SosAlert.create({
      userId,
      latitude,
      longitude,
      numberOfPersons,
      condition,
      status: 'pending'
    })

    // Notify all admins via FCM topic
    await sendToTopic(
      'admin_alerts',
      'New SOS Signal',
      `A resident needs help - ${condition}`,
      {
        sosId: sos._id.toString(),
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        type: 'sos_alert'
      }
    )

    res.status(201).json({
      message: 'SOS signal sent successfully',
      sos
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADMIN GETS ALL SOS ALERTS
export const getAllSOS = async (req, res) => {
  try {
    const alerts = await SosAlert.find()
      .populate('userId', 'name phone age healthStatus isPWD')
      .populate('rescuerId', 'name phone')
      .sort({ createdAt: -1 })   // latest first

    res.status(200).json({ alerts })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADMIN GETS A SINGLE SOS ALERT
export const getSingleSOS = async (req, res) => {
  const { id } = req.params

  try {
    const alert = await SosAlert.findById(id)
      .populate('userId', 'name phone age healthStatus isPWD')
      .populate('rescuerId', 'name phone')

    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found' })
    }

    res.status(200).json({ alert })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADMIN UPDATES SOS STATUS (dispatched/resolved/cancelled)
export const updateSOSStatus = async (req, res) => {
  const { id } = req.params
  const { status, rescuerId } = req.body

  try {
    const sos = await SosAlert.findById(id).populate('userId', 'fcmToken name')

    if (!sos) {
      return res.status(404).json({ message: 'SOS alert not found' })
    }

    // Update status
    sos.status = status
    if (rescuerId) sos.rescuerId = rescuerId
    if (status === 'resolved') sos.resolvedAt = new Date()

    await sos.save()

    // Notify resident based on status
    if (sos.userId.fcmToken) {
      const messages = {
        dispatched: {
          title: '🚑 Rescuer Dispatched',
          body: 'A rescuer has been dispatched to your location'
        },
        resolved: {
          title: 'SOS Resolved',
          body: 'Your SOS has been resolved. Stay safe!'
        },
        cancelled: {
          title: 'SOS Cancelled',
          body: 'Your SOS signal has been cancelled'
        }
      }

      if (messages[status]) {
        await sendToUser(
          sos.userId.fcmToken,
          messages[status].title,
          messages[status].body,
          {
            sosId: sos._id.toString(),
            status,
            type: 'sos_status_update'
          }
        )
      }
    }

    res.status(200).json({
      message: `SOS status updated to ${status}`,
      sos
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET SOS ALERTS BY STATUS
export const getSOSByStatus = async (req, res) => {
  const { status } = req.params

  try {
    const alerts = await SosAlert.find({ status })
      .populate('userId', 'name phone age healthStatus isPWD')
      .populate('rescuerId', 'name phone')
      .sort({ createdAt: -1 })

    res.status(200).json({ alerts })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}