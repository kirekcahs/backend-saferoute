import { Storage } from "@google-cloud/storage";
import path from "path";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICEKEY);

// Initialize Storage
const gcs = new Storage({
  projectId: serviceAccount.project_id,
  credentials: serviceAccount,
});

const bucket = gcs.bucket("saferoute-backend-696b0.firebasestorage.app");

export { bucket };