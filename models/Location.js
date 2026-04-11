import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Location', locationSchema)