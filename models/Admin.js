import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  region: {
    type: String,
    default: 'Barangay Tinajeros'
  },
  fcmToken: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'rescuer'],
    default: 'admin'
  },
respondedTo: {
  type: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SosAlert",
  }],
  default: []
},
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)

})

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('Admin', adminSchema)