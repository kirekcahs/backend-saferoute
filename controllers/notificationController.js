// controllers/notificationController.js
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { sendToUser, sendToTopic } from '../helpers/fcmService.js'

// ADMIN BROADCASTS FLOOD ALERT TO ALL USERS
export const broadcastFloodAlert = async (req, res) => {
  const { title, content, severityLevel } = req.body
  const adminId = req.user.userId

  // Alert level titles based on MC3 benchmarks from your paper
  const alertTitles = {
    'alert-2': '⚠️ Alert Level 2 - Water at 12.5m',
    'alert-3': '🚨 Alert Level 3 - Water at 13.0m',
    'critical': '🔴 CRITICAL - Evacuate Immediately',
    'info': 'ℹ️ Flood Information'
  }

  try {
    // Save notification to MongoDB
    const notification = await Notification.create({
      sentBy: adminId,
      title: alertTitles[severityLevel] || title,
      content,
      severityLevel,
      type: 'flood-alert',
      targetType: 'all'
    })

    // Broadcast to all users via FCM topic
    await sendToTopic(
      'flood_alerts_tinajeros',
      alertTitles[severityLevel] || title,
      content,
      {
        notificationId: notification._id.toString(),
        severityLevel,
        type: 'flood_alert'
      }
    )

    res.status(200).json({
      message: 'Flood alert broadcasted successfully',
      notification
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADMIN SENDS NOTIFICATION TO SPECIFIC USER
export const notifySpecificUser = async (req, res) => {
  const { userId, title, content, type } = req.body
  const adminId = req.user.userId

  try {
    // Get user's FCM token
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!user.fcmToken) {
      return res.status(400).json({ message: 'User has no FCM token registered' })
    }

    // Save notification to MongoDB
    const notification = await Notification.create({
      sentBy: adminId,
      title,
      content,
      type,
      targetType: 'specific',
      targetUserId: userId
    })

    // Send FCM to specific user
    await sendToUser(
      user.fcmToken,
      title,
      content,
      {
        notificationId: notification._id.toString(),
        type
      }
    )

    res.status(200).json({
      message: 'Notification sent successfully',
      notification
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET ALL NOTIFICATIONS
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('sentBy', 'name department')
      .populate('targetUserId', 'name phone')
      .sort({ createdAt: -1 })

    res.status(200).json({ notifications })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADMIN SENDS ANNOUNCEMENT
export const sendAnnouncement = async (req, res) => {
  const { title, content } = req.body
  const adminId = req.user.userId

  try {
    const notification = await Notification.create({
      sentBy: adminId,
      title,
      content,
      type: 'announcement',
      severityLevel: 'info',
      targetType: 'all'
    })

    await sendToTopic(
      'flood_alerts_tinajeros',
      title,
      content,
      {
        notificationId: notification._id.toString(),
        type: 'announcement'
      }
    )

    res.status(200).json({
      message: 'Announcement sent successfully',
      notification
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}