import { Storage } from '@google-cloud/storage';
import path from 'path';

// Initialize Storage
const gcs = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
}});

const bucket = gcs.bucket('saferoute-backend-696b0.firebasestorage.app'); 

export { bucket };