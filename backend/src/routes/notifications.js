import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const db = await getDb()
  const { read } = req.query
  let where = ''
  const params = []
  if (req.user.role !== 'admin') {
    where += 'WHERE userId = ? '
    params.push(req.user.id)
  }
  if (read !== undefined) {
    where += where ? 'AND ' : 'WHERE '
    where += 'read = ? '
    params.push(read === 'true' ? 1 : 0)
  }

  const notifications = db
    .prepare(`SELECT * FROM notifications ${where} ORDER BY createdAt DESC`)
    .all(...params)

  res.json({ data: await notifications })
})

export default router
