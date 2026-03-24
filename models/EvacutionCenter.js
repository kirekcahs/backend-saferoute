// models/EvacuationCenter.js
import mongoose from 'mongoose'

const evacuationCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Center name is required'],
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: [0, 'Occupancy cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  facilities: [{
    type: String,
    enum: ['medical', 'food', 'water', 'shelter', 'sanitation']
  }],
  contactPerson: {
    type: String,
    default: null
  },
  contactNumber: {
    type: String,
    default: null
  }
}, { timestamps: true })

// Virtual — check if center is full
evacuationCenterSchema.virtual('isFull').get(function () {
  return this.currentOccupancy >= this.capacity
})

// Virtual — available slots
evacuationCenterSchema.virtual('availableSlots').get(function () {
  return this.capacity - this.currentOccupancy
})

export default mongoose.model('EvacuationCenter', evacuationCenterSchema)