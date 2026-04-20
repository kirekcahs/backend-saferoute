import mongoose from "mongoose";

export const floodReportAdminSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Reporter is needed"],
    },
    description: {
      type: String,
      default: null,
    },
    floodDepth: {
      type: String,
      required: [true, "Flood depth is required"],
      enum: ["ankle-deep", "knee-deep", "chest-deep", "critical"],
    },
    streetName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("FloodReportAdmin", floodReportAdminSchema);
