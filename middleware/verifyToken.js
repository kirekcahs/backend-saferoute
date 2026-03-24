import { verifyToken } from '../helpers/jwt.js'

const protect = (req, res, next) => {
  // Check cookie first (web admin dashboard)
  let token = req.cookies.token

  // If no cookie, check Authorization header (React Native)
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split('Bearer ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  try {
    const decoded = verifyToken(token)  // { userId, role, iat, exp }
    req.user = decoded                  // attach decoded token to request
    next()                              // move to the controller
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Only allows admins through
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' })
  }
  next()
}

// Only allows rescuers through
export const rescuerOnly = (req, res, next) => {
  if (req.user.role !== 'rescuer') {
    return res.status(403).json({ message: 'Rescuer access only' })
  }
  next()
}

// Allows both admin and rescuer
export const adminOrRescuer = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'rescuer') {
    return res.status(403).json({ message: 'Unauthorized access' })
  }
  next()
}

export default protect