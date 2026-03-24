// models/SosAlert.js
import mongoose from 'mongoose'

const sosAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  numberOfPersons: {
    type: Number,
    required: [true, 'Number of persons is required'],
    min: [1, 'Must be at least 1']
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['ankle-deep', 'knee-deep', 'chest-deep', 'critical']
  },
  photoUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'resolved', 'cancelled'],
    default: 'pending'
  },
  rescuerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true })

export default mongoose.model('SosAlert', sosAlertSchema)