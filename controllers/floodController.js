// controllers/floodController.js
import FloodReport from '../models/FloodReport.js'
import { sendToTopic } from '../helpers/fcmService.js'

// USER SUBMITS FLOOD REPORT
export const submitReport = async (req, res) => {
  const { latitude, longitude, floodDepth, photoUrl, description } = req.body
  const userId = req.user.userId

  try {
    const report = await FloodReport.create({
      reportedBy: userId,
      latitude,
      longitude,
      floodDepth,
      photoUrl,
      description,
      status: 'pending'
    })

    res.status(201).json({
      message: 'Flood report submitted — pending verification',
      report
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET ALL FLOOD REPORTS
export const getAllReports = async (req, res) => {
  try {
    const reports = await FloodReport.find()
      .populate('reportedBy', 'name phone')
      .populate('verifiedBy', 'name department')
      .sort({ createdAt: -1 })

    res.status(200).json({ reports })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET ONLY VERIFIED REPORTS (for the public flood map)
export const getVerifiedReports = async (req, res) => {
  try {
    const reports = await FloodReport.find({ isVerified: true, status: 'verified' })
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({ reports })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ADMIN VERIFIES OR REJECTS A FLOOD REPORT
export const verifyReport = async (req, res) => {
  const { id } = req.params
  const { action } = req.body    // 'verify' or 'reject'
  const adminId = req.user.userId

  try {
    const report = await FloodReport.findById(id)

    if (!report) {
      return res.status(404).json({ message: 'Flood report not found' })
    }

    if (action === 'verify') {
      report.isVerified = true
      report.status = 'verified'
      report.verifiedBy = adminId
      report.verifiedAt = new Date()

      await report.save()

      // Broadcast verified flood report to all users
      await sendToTopic(
        'flood_alerts_tinajeros',
        ' Flood Area Updated',
        `Flood reported at ${report.floodDepth} depth — check the map`,
        {
          reportId: report._id.toString(),
          latitude: report.latitude.toString(),
          longitude: report.longitude.toString(),
          floodDepth: report.floodDepth,
          type: 'flood_report_verified'
        }
      )

    } else if (action === 'reject') {
      report.status = 'rejected'
      await report.save()
    }

    res.status(200).json({
      message: `Flood report ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
      report
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}