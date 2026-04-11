// models/User.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Must be at least 18'],
    max: [59, 'Must be 59 or below']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  isPWD: {
    type: Boolean,
    default: false
  },
  fcmToken: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'rescuer'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return 
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('User', userSchema)