import { Storage } from '@google-cloud/storage';
import path from 'path';

// Initialize Storage
const gcs = new Storage({
  projectId: 'saferoute-backend',
  // Points to the key file you just moved into the config folder
  keyFilename: path.join(process.cwd(), 'config', 'serviceAccountKey.json'),
});

// Replace with your actual bucket name from Google Cloud Console
const bucket = gcs.bucket('saferoute-backend-696b0.firebasestorage.app'); 

export { bucket };