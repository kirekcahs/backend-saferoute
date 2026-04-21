import Pin from "../models/Pin.js";
import FloodReport from "../models/FloodReport.js";
import Segment from "../models/Segment.js";
import FloodReportAdmin from "../models/FloodReportAdmin.js";
import { messaging } from "../config/firebase.js";

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
    return res.status(500).json({
      message: "Failed to create segment.",
      error: err.message,
    });
  }
};

export const getAllSegments = async(req, res) =>{
  try{
    const segments = await Segment.find({})
    return res.status(200).json({message: "OK", segments}) 
  }catch (err){
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
}

export const deleteSingleSegment = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Segment ID is required in the query." });
  }

  try {
    const segment = await Segment.findById(id);

    if (!segment) {
      return res.status(404).json({ message: "Segment not found." });
    }

    if (segment.report) {
      await FloodReportAdmin.findByIdAndDelete(segment.report);
    }

    await Segment.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Segment and associated flood report deleted successfully.",
      deletedSegmentId: id
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete segment.",
      error: err.message,
    });
  }
};

export const deleteAllSegments = async (req, res) => {
  try {
    // Find all segments to get their associated report IDs
    const segments = await Segment.find({});
    
    // Extract report IDs, filtering out any segments that might not have a report
    const reportIds = segments.map(seg => seg.report).filter(Boolean);

    // Delete all associated FloodReportAdmin documents
    if (reportIds.length > 0) {
      await FloodReportAdmin.deleteMany({ _id: { $in: reportIds } });
    }

    // Delete all segments
    await Segment.deleteMany({});

    return res.status(200).json({
      message: "All segments and associated flood reports deleted successfully.",
      deletedCount: segments.length
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete all segments.",
      error: err.message,
    });
  }
};

export const deleteSinglePin = async (req, res) => {
  const { id } = req.query
  if(!id){
    res.status(400).json({ message: "Pin ID is required "})
  }
  try{
    const pin = await Pin.findById(id)

    if(!pin){
      res.status(400).json("Pin is not found")
    }

    await Pin.findByIdAndDelete(id)

    return res.status(200).json({
      message: "Pin deleted successfully.",
      deletedPinId: id
    })
  }catch(err){
    return res.status(500).json({
      message: "Internal Server Error.",
      error: err.message,
    });
  }
}

export const deleteAllPin = async (req, res) => {
  try{
   await Pin.deleteMany({})

   return res.status(200).json({status: "OK", message:"All pin deleted successfully"})
    
  }catch(err){
    return res.status(500).json({
      message: "Failed to delete all pins.",
      error: err.message,
    });
  }
}