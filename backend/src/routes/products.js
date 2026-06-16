import { Router } from 'express'
import { getDb, parseProduct } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

const buildProductResponse = (row) => {
  const product = parseProduct(row)
  return { ...product, discountEnabled: Boolean(product.discountEnabled) }
}

const getDiscountInput = (body) => body.discount || {
  enabled: body.discountEnabled,
  percent: body.discountPercent,
  start: body.discountStart,
  end: body.discountEnd,
}

const serializeTags = (tags) => {
  if (typeof tags === 'string') return tags
  return JSON.stringify(Array.isArray(tags) ? tags : [])
}

const validateProduct = (body) => {
  const errors = []
  const name = String(body.name || '').trim()
  const price = Number(body.price)
  const stock = Number(body.stock)
  const discount = getDiscountInput(body)
  if (!name) errors.push('Product name is required.')
  if (!price || Number.isNaN(price) || price <= 0) errors.push('Price must be a positive number.')
  if (Number.isNaN(stock) || stock < 0) errors.push('Stock must be zero or more.')
  if (discount?.enabled && discount.percent !== undefined) {
    const percent = Number(discount.percent)
    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
      errors.push('Discount percent must be between 0 and 100.')
    }
  }
  return errors
}

router.get('/', async (req, res) => {
  const db = await getDb()
  const { q, tag, page = 1, limit = 20 } = req.query
  const offset = (Math.max(Number(page), 1) - 1) * Math.max(Number(limit), 1)
  const terms = []
  let where = 'WHERE 1=1'

  if (q) {
    where += ' AND LOWER(name) LIKE ?'
    terms.push(`%${String(q).trim().toLowerCase()}%`)
  }
  if (tag) {
    where += ' AND tags LIKE ?'
    terms.push(`%"${String(tag).trim()}"%`)
  }

  const products = db
    .prepare(`SELECT * FROM products ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
    .all(...terms, Number(limit), offset)
    .then((rows) => rows.map(buildProductResponse))

  const [{ total }, data] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS total FROM products ${where}`).get(...terms),
    products,
  ])
  res.json({ data, meta: { total, page: Number(page), limit: Number(limit) } })
})

router.get('/:id', async (req, res, next) => {
  const db = await getDb()
  const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!product) {
    const err = new Error('Product not found.')
    err.status = 404
    err.expose = true
    return next(err)
  }
  res.json(buildProductResponse(product))
})

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  const db = await getDb()
  const errors = validateProduct(req.body)
  if (errors.length) {
    const err = new Error(errors.join(' '))
    err.status = 400
    err.expose = true
    return next(err)
  }

  const now = new Date().toISOString()
  const tags = serializeTags(req.body.tags)
  const discount = getDiscountInput(req.body)
  const discountEnabled = Boolean(discount?.enabled)
  const result = db
    .prepare(
      `INSERT INTO products (name, price, stock, tags, imageUrl, discountEnabled, discountPercent, discountStart, discountEnd, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      req.body.name.trim(),
      Number(req.body.price),
      Number(req.body.stock),
      tags,
      String(req.body.image || req.body.imageUrl || '').trim(),
      discountEnabled ? 1 : 0,
      Number(discount?.percent || 0),
      discount?.start || null,
      discount?.end || null,
      now,
      now,
    )

  const created = await result
  const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(created.lastInsertRowid)
  res.status(201).json(buildProductResponse(product))
})

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  const db = await getDb()
  const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!product) {
    const err = new Error('Product not found.')
    err.status = 404
    err.expose = true
    return next(err)
  }

  const body = { ...product, ...req.body }
  const errors = validateProduct(body)
  if (errors.length) {
    const err = new Error(errors.join(' '))
    err.status = 400
    err.expose = true
    return next(err)
  }

  const now = new Date().toISOString()
  const tags = serializeTags(body.tags)
  const discount = getDiscountInput(body)
  const discountEnabled = Boolean(discount?.enabled)
  await db.prepare(
    `UPDATE products SET name = ?, price = ?, stock = ?, tags = ?, imageUrl = ?, discountEnabled = ?, discountPercent = ?, discountStart = ?, discountEnd = ?, updatedAt = ? WHERE id = ?`,
    ).run(
    body.name.trim(),
    Number(body.price),
    Number(body.stock),
    tags,
    String(body.image || body.imageUrl || '').trim(),
    discountEnabled ? 1 : 0,
    Number(discount?.percent || 0),
    discount?.start || null,
    discount?.end || null,
    now,
    req.params.id,
  )

  const updated = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  res.json(buildProductResponse(updated))
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  const db = await getDb()
  const result = await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id)
  if (!result.changes) {
    const err = new Error('Product not found.')
    err.status = 404
    err.expose = true
    return next(err)
  }
  res.status(204).end()
})

export default router
