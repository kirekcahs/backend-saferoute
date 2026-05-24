import { messaging } from '../config/firebase.js'

const buildAndroidConfig = (channelId = 'flood_alerts') => ({
  priority: 'HIGH',                    // ✅ uppercase
  notification: {
    channelId,
    sound: 'default',
    defaultSound: true,                // ✅ add this as fallback
    defaultVibrateTimings: false,
    vibrateTimingsMillis: [0, 250, 250, 250],
  },
})

// Send to a single user
export const sendToUser = async (fcmToken, title, body, data = {}) => {
  const message = {
    token: fcmToken,
    notification: { title, body },
    data: stringifyData(data),         // ✅ ensure all values are strings
    android: buildAndroidConfig(),
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
    data: stringifyData(data),         // ✅ ensure all values are strings
    android: buildAndroidConfig(),
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
    data: stringifyData(data),         // ✅ ensure all values are strings
    android: buildAndroidConfig(),
  }
  try {
    const response = await messaging.sendEachForMulticast(message)
    return response
  } catch (err) {
    console.error('FCM multicast error:', err)
    throw err
  }
}

// ✅ helper — FCM requires all data values to be strings
const stringifyData = (data) =>
  Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  )