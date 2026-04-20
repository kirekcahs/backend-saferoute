import mongoose from "mongoose";

const pinSchema = new mongoose.Schema({
  coords: {
    type: [Number],
    required: true,
    validate: {
        validator: (val) => val.length === 2,
        message: 'Coords must have exactly 2 numbers [latitude, longitude]'
    }
},
  pinName: {
    type: String,
    required: [true, "Name is required"],
  },
  description: {
    type: String,
    default: null,
  },
}, {timestamps: true}
);

export default mongoose.model("Pin", pinSchema);
