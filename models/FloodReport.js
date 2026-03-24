// models/FloodReport.js
import mongoose from 'mongoose'

const floodReportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  floodDepth: {
    type: String,
    required: [true, 'Flood depth is required'],
    enum: ['ankle-deep', 'knee-deep', 'chest-deep', 'critical']
  },
  photoUrl: {
    type: String,
    required: [true, 'Photo evidence is required']
  },
  description: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true })

export default mongoose.model('FloodReport', floodReportSchema)