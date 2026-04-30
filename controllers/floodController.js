import FloodReport from "../models/FloodReport.js";
import { sendToTopic } from "../helpers/fcmService.js";
import { bucket } from "../config/gcs.js";
// import { broadcast } from "../helpers/websocket.js";

// USER SUBMITS FLOOD REPORT
export const submitReport = async (req, res) => {
  const { latitude, longitude, floodDepth, streetName, description } =
    req.body || {};
  const userId = req.user?.userId;

    const coords = latitude && longitude
    ? [parseFloat(latitude), parseFloat(longitude)]
    : null;

  // VALIDATION: Check for the values we need
  if (!coords || !req.file) {
    return res.status(400).json({
      error:
        "Data missing from request. Ensure latitude, longitude, and an image are provided.",
      debug: {
        body: req.body,
        file: !!req.file,
      },
    });
  }
  try {
    // Setup the file metadata for GCS
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const fileName = `reports/${Date.now()}_${safeName}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: { contentType: req.file.mimetype },
    });

    blobStream.on("error", (err) => {
      return res.status(500).json({ error: err.message });
    });

    blobStream.on("finish", async () => {
      // The public URL for the database of the image report
      const encodedFileName = encodeURIComponent(blob.name);
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFileName}?alt=media`;

      // Create the database record
      const report = await FloodReport.create({
        reportedBy: userId,
        coords,
        floodDepth,
        streetName,
        photoUrl: publicUrl, // Using the URL from Google
        description,
        status: "pending",
      });

      // broadcast({ type: "flood_report_submitted", data: report });

      res.status(201).json({
        message: "Flood report submitted — pending verification",
        report,
      });
    });

    // Start the upload
    blobStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL FLOOD REPORTS
export const getAllReports = async (req, res) => {
  try {
    const reports = await FloodReport.find()
      .populate("reportedBy", "name phone")
      .populate("verifiedBy", "name department")
      .sort({ createdAt: -1 });

    res.status(200).json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONLY VERIFIED REPORTS (for the public flood map)
export const getVerifiedReports = async (req, res) => {
  try {
    const reports = await FloodReport.find({
      isVerified: true,
      status: "verified",
    })
      .populate("reportedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN VERIFIES OR REJECTS A FLOOD REPORT
export const verifyReport = async (req, res) => {
  const { id } = req.query;
  const { action } = req.body; // 'verify' or 'reject'
  const adminId = req.user.userId;

  try {
    const report = await FloodReport.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Flood report not found" });
    }

    if (action === "verify") {
      report.isVerified = true;
      report.status = "verified";
      report.verifiedBy = adminId;
      report.verifiedAt = new Date();

      await report.save();

      // Broadcast verified flood report to all users
      await sendToTopic(
        "flood_alerts_tinajeros",
        " Flood Area Updated",
        `Flood reported at ${report.floodDepth} depth — check the map`,
        {
          reportId: report._id.toString(),
          longitude: report.coords[0].toString(),
          latitude: report.coords[1].toString(),
          floodDepth: report.floodDepth,
          type: "flood_report_verified",
        },
      );

      broadcast({ type: "flood_report_verified", data: report });
    } else if (action === "reject") {
      report.status = "rejected";
      await report.save();

      broadcast({ type: "flood_report_rejected", data: { id: report._id } });
    }

    res.status(200).json({
      message: `Flood report ${action === "verify" ? "verified" : "rejected"} successfully`,
      report,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
