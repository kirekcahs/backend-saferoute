import { Storage } from '@google-cloud/storage';
import path from 'path';

// Initialize Storage
const gcs = new Storage({
  projectId: 'saferoute-backend',
  keyFilename: path.join(process.cwd(), 'config', 'serviceAccountKey.json'),
});

const bucket = gcs.bucket('saferoute-backend-696b0.firebasestorage.app'); 

export { bucket };