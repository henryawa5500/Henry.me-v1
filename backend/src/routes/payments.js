import path from 'path'
import multer from 'multer'
import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { sendPaymentStatusEmail } from '../services/email.js'

const router = Router()
const useMemoryUploads = process.env.VERCEL === '1' || process.env.UPLOAD_STORAGE === 'database'
const uploadDir = process.env.UPLOAD_DIR || './uploads'
const uploadPath = path.resolve(process.cwd(), uploadDir)
const storage = useMemoryUploads
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadPath),
      filename: (req, file, cb) => {
        const timestamp = Date.now()
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
        cb(null, `${timestamp}-${safeName}`)
      },
    })
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

router.post('/verify', requireAuth, requireAdmin, upload.single('receipt'), async (req, res, next) => {
  const db = await getDb()
  const { orderId, status, failureReason } = req.body
  if (!orderId || !status) {
    const err = new Error('orderId and status are required.')
    err.status = 400
    err.expose = true
    return next(err)
  }

  const payment = db
    .prepare('SELECT * FROM payments WHERE id = (SELECT paymentId FROM orders WHERE id = ?)')
    .get(orderId)
  const savedPayment = await payment
  if (!savedPayment) {
    const err = new Error('Payment record not found for order.')
    err.status = 404
    err.expose = true
    return next(err)
  }

  const accepted = ['Verified', 'Verification Failed', 'Pending Verification']
  if (!accepted.includes(status)) {
    const err = new Error('Invalid payment status.')
    err.status = 400
    err.expose = true
    return next(err)
  }

  const now = new Date().toISOString()
  const receiptPath = req.file
    ? useMemoryUploads
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : path.relative(process.cwd(), req.file.path)
    : savedPayment.receiptPath

  await db.prepare(
    'UPDATE payments SET status = ?, receiptPath = ?, failureReason = ?, verifiedAt = ?, updatedAt = ? WHERE id = ?',
  ).run(status, receiptPath, failureReason || '', status === 'Verified' ? now : savedPayment.verifiedAt, now, savedPayment.id)

  const orderStatus = status === 'Verified' ? 'Paid' : status === 'Verification Failed' ? 'Pending' : 'Pending'
  await db.prepare('UPDATE orders SET status = ?, updatedAt = ? WHERE paymentId = ?').run(orderStatus, now, savedPayment.id)

  const order = await db.prepare('SELECT * FROM orders WHERE paymentId = ?').get(savedPayment.id)
  await db.prepare(
    'INSERT INTO notifications (userId, orderId, type, message, read, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(
    order.userId,
    order.id,
    'payment_verification',
    `Payment for order ${order.id} has status ${status}.`,
    0,
    now,
  )

  await sendPaymentStatusEmail({
    ...order,
    customer: {
      name: order.customerName || 'Customer',
      email: order.customerEmail || '',
    },
  }, status)

  res.json({ paymentId: savedPayment.id, status, receiptPath })
})

export default router
