import fs from 'fs'
import path from 'path'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import ordersRoutes from './routes/orders.js'
import usersRoutes from './routes/users.js'
import notificationsRoutes from './routes/notifications.js'
import paymentsRoutes from './routes/payments.js'
import uploadRoutes from './routes/upload.js'
import { errorHandler } from './middleware/errors.js'

const app = express()
const root = process.cwd()
const uploadDir = process.env.UPLOAD_DIR || './uploads'
const uploadPath = path.resolve(root, uploadDir)

if (!process.env.VERCEL && !fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true })
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

app.use('/auth', authRoutes)
app.use('/products', productsRoutes)
app.use('/orders', ordersRoutes)
app.use('/users', usersRoutes)
app.use('/notifications', notificationsRoutes)
app.use('/payments', paymentsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/upload', uploadRoutes)
app.use('/uploads', express.static(uploadPath))

app.get('/', (req, res) => {
  res.json({ message: 'HenryME backend is running' })
})

app.use(errorHandler)

export default app
