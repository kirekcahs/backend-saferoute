import mongoose from "mongoose";

const sosAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    coords: {
      latitude: {
        type: Number,
        required: [true, "Latitude is required."],
      },
      longitude: {
        type: Number,
        required: [true, "Longitude is required."],
      },
    },
    numberOfPersons: {
      type: Number,
      default: null,
    },
    streetName: {
      type: String,
      default: null,
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["ankle-deep", "knee-deep", "chest-deep", "critical"],
    },
    status: {
      type: String,
      enum: ["pending", "dispatched", "resolved", "cancelled"],
      default: "pending",
    },
    rescuerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    rescuerCoords: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("SosAlert", sosAlertSchema);
