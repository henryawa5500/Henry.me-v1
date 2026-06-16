import jwt from 'jsonwebtoken'
import { getDb } from '../db.js'

const secret = process.env.JWT_SECRET || 'change-this-secret'

export const signToken = (payload) => jwt.sign(payload, secret, { expiresIn: '6h' })

export const verifyToken = (token) => jwt.verify(token, secret)

export const requireAuth = async (req, res, next) => {
  const authHeader = String(req.headers.authorization || '')
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    const err = new Error('Authentication required')
    err.status = 401
    err.expose = true
    return next(err)
  }
  try {
    const payload = verifyToken(token)
    const db = await getDb()
    const user = await db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(payload.id)
    if (!user) {
      const err = new Error('Invalid authentication token')
      err.status = 401
      err.expose = true
      return next(err)
    }
    req.user = user
    next()
  } catch {
    const err = new Error('Invalid authentication token')
    err.status = 401
    err.expose = true
    next(err)
  }
}

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    const err = new Error('Admin privileges required')
    err.status = 403
    err.expose = true
    return next(err)
  }
  next()
}
