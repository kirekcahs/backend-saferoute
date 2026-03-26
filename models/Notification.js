// models/Notification.js
import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Sender is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  severityLevel: {
    type: String,
    enum: ['info', 'alert-2', 'alert-3', 'critical'],
    default: 'info'
  },
  type: {
    type: String,
    enum: ['flood-alert', 'announcement', 'rescuer-dispatched', 'all-clear'],
    required: [true, 'Type is required']
  },
  targetType: {
    type: String,
    enum: ['all', 'specific'],
    default: 'all'
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

export default mongoose.model('Notification', notificationSchema)