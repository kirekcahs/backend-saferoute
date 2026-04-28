import mongoose from "mongoose";

export const segmentSchema = new mongoose.Schema(
  {
    points: {
      type: [[Number]],
      required: true,
      validate: {
        validator: function (val) {
          // Must have 2 or 3 points
          if (val.length < 2 || val.length > 3) return false;

          // Each point must have exactly 2 numbers (lat, lon)
          if (val[0].length !== 2 || val[1].length !== 2) return false;
          if (val[2] && val[2].length !== 2) return false;

          return true;
        },
        message:
          "Points must contain 2 or 3 coordinates: [[lat1, lon1], [lat2, lon2]] or [[lat1, lon1], [lat2, lon2], [lat3, lon3]]",
      },
    },
    coords: {
      type: [[Number]],
      required: true,
    },
    floodReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FloodReportAdmin",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Segment", segmentSchema);
