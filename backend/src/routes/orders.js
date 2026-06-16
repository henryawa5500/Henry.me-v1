import { Router } from 'express'
import { getDb, parseOrder } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { sendOrderCreatedEmails, sendPaymentStatusEmail } from '../services/email.js'

const router = Router()

const allowedStatuses = ['Pending', 'Paid', 'Fulfilled', 'Cancelled']

const parseAddress = (address) => {
  if (!address || typeof address !== 'object') return null
  const fields = ['fullName', 'phone', 'addressLine', 'city', 'state', 'notes']
  return fields.reduce((acc, key) => {
    acc[key] = String(address[key] || '').trim()
    return acc
  }, {})
}

const validateOrderPayload = ({ items, shippingAddress }) => {
  const errors = []
  if (!Array.isArray(items) || !items.length) errors.push('Order items are required.')
  if (!shippingAddress || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.state || !shippingAddress.phone) {
    errors.push('A valid shipping address is required.')
  }
  return errors
}

const createNotification = async (db, userId, orderId, type, message) => {
  const now = new Date().toISOString()
  await db.prepare(
    'INSERT INTO notifications (userId, orderId, type, message, read, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(userId, orderId, type, message, 0, now)
}

const buildOrderResponse = async (db, order) => {
  const savedOrder = parseOrder(order)
  const [items, payment] = await Promise.all([
    db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id),
    db.prepare('SELECT * FROM payments WHERE id = ?').get(order.paymentId),
  ])
  return {
    ...savedOrder,
    customer: {
      name: savedOrder.customerName || savedOrder.customer?.name || 'Guest',
      email: savedOrder.customerEmail || savedOrder.customer?.email || '',
    },
    items,
    payment,
  }
}

router.get('/', requireAuth, async (req, res) => {
  const db = await getDb()
  const { status, page = 1, limit = 20 } = req.query
  const offset = (Math.max(Number(page), 1) - 1) * Math.max(Number(limit), 1)
  let where = ''
  const params = []

  if (req.user.role !== 'admin') {
    where += 'WHERE userId = ? '
    params.push(req.user.id)
  }
  if (status) {
    where += where ? 'AND status = ? ' : 'WHERE status = ? '
    params.push(String(status))
  }

  const rows = db
    .prepare(`SELECT * FROM orders ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
    .all(...params, Number(limit), offset)
  const savedRows = await rows

  const orders = await Promise.all(savedRows.map((row) => buildOrderResponse(db, row)))

  const { total } = await db
    .prepare(`SELECT COUNT(*) AS total FROM orders ${where}`)
    .get(...params)

  res.json({ data: orders, meta: { total, page: Number(page), limit: Number(limit) } })
})

router.get('/:id', requireAuth, async (req, res, next) => {
  const db = await getDb()
  const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!order) {
    const err = new Error('Order not found.')
    err.status = 404
    err.expose = true
    return next(err)
  }
  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    const err = new Error('Access denied.')
    err.status = 403
    err.expose = true
    return next(err)
  }
  res.json(await buildOrderResponse(db, order))
})

router.post('/', requireAuth, async (req, res, next) => {
  const db = await getDb()
  const { items, shippingAddress } = req.body
  const errors = validateOrderPayload({ items, shippingAddress })
  if (errors.length) {
    const err = new Error(errors.join(' '))
    err.status = 400
    err.expose = true
    return next(err)
  }

  const preparedItems = []
  let subtotal = 0

  for (const item of items) {
    const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId)
    if (!product) {
      const err = new Error(`Product ${item.productId} not found.`)
      err.status = 400
      err.expose = true
      return next(err)
    }
    const quantity = Number(item.quantity)
    if (!quantity || Number.isNaN(quantity) || quantity <= 0) {
      const err = new Error('Each order item must include a positive quantity.')
      err.status = 400
      err.expose = true
      return next(err)
    }
    if (quantity > product.stock) {
      const err = new Error(`Not enough stock for ${product.name}.`)
      err.status = 400
      err.expose = true
      return next(err)
    }
    const unitPrice = product.price
    subtotal += unitPrice * quantity
    preparedItems.push({ product, quantity, size: String(item.size || 'M') })
  }

  const deliveryFee = subtotal >= 15000 ? 0 : 1200
  const total = subtotal + deliveryFee
  const now = new Date().toISOString()
  const addressJson = JSON.stringify(parseAddress(shippingAddress))

  const paymentResult = await db
    .prepare(
      'INSERT INTO payments (method, reference, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
    )
    .run('Bank Transfer', `HM-${Date.now()}`, 'Pending Verification', now, now)

  const orderResult = await db
    .prepare(
      `INSERT INTO orders (userId, customerName, customerEmail, shippingAddress, subtotal, deliveryFee, total, status, paymentId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      req.user.id,
      req.user.name,
      req.user.email,
      addressJson,
      subtotal,
      deliveryFee,
      total,
      'Pending',
      paymentResult.lastInsertRowid,
      now,
      now,
    )

  for (const item of preparedItems) {
    await db.prepare(
      'INSERT INTO order_items (orderId, productId, name, imageUrl, size, quantity, unitPrice) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(
      orderResult.lastInsertRowid,
      item.product.id,
      item.product.name,
      item.product.imageUrl,
      item.size,
      item.quantity,
      item.unitPrice,
    )
    await db.prepare('UPDATE products SET stock = stock - ?, updatedAt = ? WHERE id = ?').run(
      item.quantity,
      now,
      item.product.id,
    )
  }

  await createNotification(
    db,
    req.user.id,
    orderResult.lastInsertRowid,
    'order_new',
    `Order ${orderResult.lastInsertRowid} has been created and is pending payment verification.`,
  )

  const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderResult.lastInsertRowid)
  const response = await buildOrderResponse(db, order)
  await sendOrderCreatedEmails(response)
  res.status(201).json(response)
})

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  const db = await getDb()
  const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!order) {
    const err = new Error('Order not found.')
    err.status = 404
    err.expose = true
    return next(err)
  }

  const data = req.body
  const updates = []
  const params = []

  if (data.customerName) {
    updates.push('customerName = ?')
    params.push(String(data.customerName).trim())
  }
  if (data.customerEmail) {
    updates.push('customerEmail = ?')
    params.push(String(data.customerEmail).trim())
  }
  if (data.shippingAddress) {
    updates.push('shippingAddress = ?')
    params.push(JSON.stringify(parseAddress(data.shippingAddress)))
  }
  if (data.status && allowedStatuses.includes(data.status)) {
    updates.push('status = ?')
    params.push(String(data.status))
  }

  if (!updates.length) {
    const err = new Error('No valid order fields provided.')
    err.status = 400
    err.expose = true
    return next(err)
  }

  updates.push('updatedAt = ?')
  params.push(new Date().toISOString())
  params.push(req.params.id)

  await db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...params)
  const updated = await db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  res.json(await buildOrderResponse(db, updated))
})

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  const db = await getDb()
  const { status } = req.body
  if (!status || !allowedStatuses.includes(status)) {
    const err = new Error('Invalid order status.')
    err.status = 400
    err.expose = true
    return next(err)
  }

  const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!order) {
    const err = new Error('Order not found.')
    err.status = 404
    err.expose = true
    return next(err)
  }

  const now = new Date().toISOString()
  await db.prepare('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?').run(status, now, req.params.id)

  if (status === 'Paid') {
    await db.prepare('UPDATE payments SET status = ?, updatedAt = ? WHERE id = ?').run('Verified', now, order.paymentId)
  }

  await createNotification(
    db,
    order.userId,
    order.id,
    `order_${status.toLowerCase()}`,
    `Order ${order.id} status updated to ${status}.`,
  )

  const updated = await db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  const response = await buildOrderResponse(db, updated)
  if (status === 'Paid') {
    await sendPaymentStatusEmail(response, 'Verified')
  }
  res.json({ id: order.id, status })
})

export default router
