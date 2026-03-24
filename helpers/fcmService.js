// helpers/fcmService.js
import { messaging } from '../config/firebase.js'

// Send to a single user
export const sendToUser = async (fcmToken, title, body, data = {}) => {
  const message = {
    token: fcmToken,
    notification: { title, body },
    data,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'flood_alerts'
      }
    }
  }

  try {
    const response = await messaging.send(message)
    return response
  } catch (err) {
    console.error('FCM single error:', err)
    throw err
  }
}

// Broadcast to all users via topic
export const sendToTopic = async (topic, title, body, data = {}) => {
  const message = {
    topic,
    notification: { title, body },
    data,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'flood_alerts'
      }
    }
  }

  try {
    const response = await messaging.send(message)
    return response
  } catch (err) {
    console.error('FCM topic error:', err)
    throw err
  }
}

// Send to multiple specific users
export const sendToMultiple = async (fcmTokens, title, body, data = {}) => {
  const message = {
    tokens: fcmTokens,
    notification: { title, body },
    data,
    android: { priority: 'high' }
  }

  try {
    const response = await messaging.sendEachForMulticast(message)
    return response
  } catch (err) {
    console.error('FCM multicast error:', err)
    throw err
  }
}