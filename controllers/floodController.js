import FloodReport from "../models/FloodReport.js";
import { sendToTopic } from "../helpers/fcmService.js";
import { bucket } from "../config/gcs.js";
import { broadcast } from "../helpers/websocket.js";

// USER SUBMITS FLOOD REPORT
export const submitReport = async (req, res) => {
  const { latitude, longitude, floodDepth, streetName, description } =
    req.body || {};
  const userId = req.user?.userId;

  const coords =
    latitude && longitude
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reports, totalReports] = await Promise.all([
      FloodReport.find()
        .populate("reportedBy", "name phone")
        .populate("verifiedBy", "name department")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FloodReport.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalReports / limit);

    res.status(200).json({
      pagination: {
        totalReports,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      reports,
    });
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
  const { action } = req.body; 
  const adminId = req.user?.userId;

  // 1. Input Validation
  if (!id) {
    return res.status(400).json({ message: "Report ID is required." });
  }

  const allowedActions = ["verify", "reject"];
  if (!allowedActions.includes(action)) {
    return res.status(400).json({ 
      message: `Invalid action. Allowed actions are: ${allowedActions.join(", ")}` 
    });
  }

  try {
    const report = await FloodReport.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Flood report not found." });
    }

    if (action === "verify") {
      report.isVerified = true;
      report.status = "verified";
      report.verifiedBy = adminId;
      report.verifiedAt = new Date();

      await report.save();


      await sendToTopic(
        "flood_alerts_tinajeros",
        "Flood Area Updated",
        `Flood reported at ${report.floodDepth} depth — check the map`,
        {
          reportId: report._id.toString(),
          latitude: report.coords[0].toString(),  
          longitude: report.coords[1].toString(), 
          floodDepth: report.floodDepth,
          type: "flood_report_verified",
        },
      );

      const populatedReport = await FloodReport.findById(report._id)
        .populate("reportedBy")
        .populate("verifiedBy");

      broadcast({ type: "flood_report_verified", data: populatedReport });

      return res.status(200).json({
        message: "Flood report verified successfully",
        report: populatedReport,
      });

    } else if (action === "reject") {
      report.status = "rejected";
      await report.save();

      const populatedReport = await FloodReport.findById(report._id)
        .populate("reportedBy");

      broadcast({ type: "flood_report_rejected", data: { id: report._id } });

      return res.status(200).json({
        message: "Flood report rejected successfully",
        report: populatedReport,
      });
    }

  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const getAllReportsByStatus = async (req, res) => {
  const { status } = req.query;

  if (!status) {
    return res.status(400).json({ message: "Status query parameter is required." });
  }

 
  const allowedStatuses = ["pending", "verified", "rejected"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [reports, totalReports] = await Promise.all([
      FloodReport.find({ status })
        .populate("reportedBy") 
        .populate("verifiedBy") 
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FloodReport.countDocuments({ status }),
    ]);

    const totalPages = Math.ceil(totalReports / limit);

    res.status(200).json({
      message: "OK",
      pagination: {
        totalReports,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      reports,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const deleteSingleFloodReport = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "FloodReport ID is required" });
  }

  try {
    const floodReport = await FloodReport.findById(id);

    if (!floodReport) {
      return res.status(404).json({ message: "Flood report is not found." });
    }

    // Delete the image from GCS
    if (floodReport.photoUrl) {
      try {
        let fileName;
        const url = floodReport.photoUrl;

        if (url.includes("firebasestorage.googleapis.com") || url.includes("firebasestorage.app")) {
          const match = url.match(/\/o\/(.+?)\?/);
          fileName = match ? decodeURIComponent(match[1]) : null;
        } else {
          fileName = url.split(`${bucket.name}/`)[1];
        }

        if (fileName) {
          await bucket.file(fileName).delete();
        }
      } catch (gcsErr) {
        console.warn("GCS delete failed:", gcsErr.message);
      }
    }

    await FloodReport.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Flood report and image deleted successfully.",
      deletedFloodReportID: id,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error.",
      error: err.message,
    });
  }
};