import admin from 'firebase-admin'
import { readFileSync } from 'fs'

const serviceAccount = JSON.parse()

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

export const messaging = admin.messaging()
export default admin