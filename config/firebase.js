import admin from 'firebase-admin'
import { readFileSync } from 'fs'

const serviceAccount = JSON.parse(
  readFileSync('./config/serviceAccountKey.json', 'utf8')
)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // ← No databaseURL needed since you're using MongoDB
  })
}

export const messaging = admin.messaging()
export default admin