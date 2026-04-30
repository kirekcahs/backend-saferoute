import mongoose from "mongoose";

const floodReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"],
    },
    coords: {
      type: [Number],
      required: [true, "Coords is required"],
    },
    floodDepth: {
      type: String,
      required: [true, "Flood depth is required"],
      enum: ["ankle-deep", "knee-deep", "chest-deep", "critical"],
    },
    streetName: {
      type: String,
      required: [true, "Street Name is required"],
    },
    photoUrl: {
      type: String,
      required: [true, "Photo evidence is required"],
    },
    description: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("FloodReport", floodReportSchema);
