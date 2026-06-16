import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getDb } from '../db.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

const validateSignup = ({ name, email, password }) => {
  const errors = []
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters.')
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('A valid email is required.')
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password is required and must be at least 8 characters.')
  }
  return errors
}

router.post('/signup', async (req, res, next) => {
  const db = await getDb()
  const { name, email, password } = req.body
  const errors = validateSignup({ name, email, password })
  if (errors.length) {
    const err = new Error(errors.join(' '))
    err.status = 400
    err.expose = true
    return next(err)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const userExists = await db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail)
  if (userExists) {
    const err = new Error('Email is already in use.')
    err.status = 409
    err.expose = true
    return next(err)
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const now = new Date().toISOString()
  const result = await db.prepare(
    'INSERT INTO users (name, email, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, ?)',
  ).run(name.trim(), normalizedEmail, passwordHash, 'user', now)

  const user = { id: result.lastInsertRowid, name: name.trim(), email: normalizedEmail, role: 'user' }
  const token = signToken({ id: user.id, role: user.role })
  res.status(201).json({ user, token })
})

router.post('/login', async (req, res, next) => {
  const db = await getDb()
  const { email, password } = req.body
  if (!email || !password) {
    const err = new Error('Email and password are required.')
    err.status = 400
    err.expose = true
    return next(err)
  }

  const user = db
    .prepare('SELECT id, name, email, passwordHash, role FROM users WHERE email = ?')
    .get(email.trim().toLowerCase())
  const savedUser = await user

  if (!savedUser || !bcrypt.compareSync(password, savedUser.passwordHash)) {
    const err = new Error('Invalid email or password.')
    err.status = 401
    err.expose = true
    return next(err)
  }

  const token = signToken({ id: savedUser.id, role: savedUser.role })
  res.json({
    user: { id: savedUser.id, name: savedUser.name, email: savedUser.email, role: savedUser.role },
    token,
  })
})

export default router
