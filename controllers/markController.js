import Pin from "../models/Pin.js";
import FloodReport from "../models/FloodReport.js";
import Segment from "../models/Segment.js";
import FloodReportAdmin from "../models/FloodReportAdmin.js";

export const createPinFlood = async (req, res) => {
  // Destructure all required fields for both Pin and FloodReport
  const {
    latitude,
    longitude,
    pinName = "Flood Warning", // Fallback for Pin schema
    description,
  } = req.body;

  // Validate essential fields early
  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ message: "Latitude and longitude are required." });
  }

  try {
    // Create the generic map Pin
    const pin = await Pin.create({
      coords: [latitude, longitude],
      pinName,
      description,
    });

    // Return a success response with both created documents
    return res.status(201).json({
      message: "Flood pin and report created successfully",
      pin,
    });
  } catch (err) {
    // Handle Mongoose validation errors or server issues
    console.error("Error creating flood pin/report:", err);
    return res.status(500).json({
      message: "Failed to create flood pin and report.",
      error: err.message,
    });
  }
};

export const getAllPinned = async (req, res) => {
  try {
    const pins = await Pin.find({});
    res.status(200).json({ message: "OK", pins });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export const createSegment = async (req, res) => {
  const { points, coords, description, floodDepth, streetName } = req.body;
  const userId = req.user?.userId

  // Basic validation for required fields
  if (!points || !coords) {
    return res.status(400).json({ message: "Points and coords are required." });
  }

  if (!Array.isArray(points) || points.length !== 2) {
    return res
      .status(400)
      .json({ message: "Points must be an array of exactly 2 numbers." });
  }

  try {

    const newFloodReportAdmin = await FloodReportAdmin.create({
        reportedBy: userId,
        description,
        floodDepth,
        streetName
    })
   
    const newSegment = await Segment.create({
      points,
      coords,
      report: newFloodReportAdmin._id, 
    });
     console.log(req)
    return res.status(201).json({
      message: "Segment created successfully",
      segment: newSegment,
      floodReport: newFloodReportAdmin
    });
  } catch (err) {
    console.error("Error creating segment:", err);
    return res.status(500).json({
      message: "Failed to create segment.",
      error: err.message,
    });
  }
};