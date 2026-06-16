import path from 'path'
import multer from 'multer'
import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

const useMemoryUploads = process.env.VERCEL === '1' || process.env.UPLOAD_STORAGE === 'database'

const storage = useMemoryUploads
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads'
        cb(null, path.resolve(process.cwd(), uploadDir))
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now()
        const filename = `${timestamp}-${file.originalname}`
        cb(null, filename)
      },
    })

const upload = multer({ storage })

router.post('/', requireAuth, requireAdmin, upload.single('image'), (req, res, next) => {
  if (!req.file) {
    const err = new Error('No file uploaded.')
    err.status = 400
    err.expose = true
    return next(err)
  }

  if (useMemoryUploads) {
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    res.json({ url: dataUrl })
    return
  }

  const relative = `/uploads/${req.file.filename}`
  const host = req.get('host')
  const protocol = req.protocol
  const url = `${protocol}://${host}${relative}`
  res.json({ url })
})

export default router
