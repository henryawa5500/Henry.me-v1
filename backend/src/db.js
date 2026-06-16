import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import pg from 'pg'

const { Pool } = pg

const dbFile = process.env.DB_FILE || './data/henryme.db'
const dbPath = path.resolve(process.cwd(), dbFile)
const dbDir = path.dirname(dbPath)
const databaseUrl = process.env.DATABASE_URL
const isPostgres = Boolean(databaseUrl)

const keyMap = {
  passwordhash: 'passwordHash',
  imageurl: 'imageUrl',
  discountenabled: 'discountEnabled',
  discountpercent: 'discountPercent',
  discountstart: 'discountStart',
  discountend: 'discountEnd',
  createdat: 'createdAt',
  updatedat: 'updatedAt',
  userid: 'userId',
  customername: 'customerName',
  customeremail: 'customerEmail',
  shippingaddress: 'shippingAddress',
  deliveryfee: 'deliveryFee',
  paymentid: 'paymentId',
  orderid: 'orderId',
  productid: 'productId',
  unitprice: 'unitPrice',
  receiptpath: 'receiptPath',
  failurereason: 'failureReason',
  verifiedat: 'verifiedAt',
}

const normalizeRow = (row) => {
  if (!row) return row
  return Object.entries(row).reduce((acc, [key, value]) => {
    acc[keyMap[key] || key] = value
    return acc
  }, {})
}

const normalizeRows = (rows) => rows.map(normalizeRow)

const toPostgresSql = (sql) => {
  let index = 0
  return sql.replace(/\?/g, () => `$${++index}`)
}

const getInsertTable = (sql) => {
  const match = sql.trim().match(/^INSERT\s+INTO\s+([a-z_][a-z0-9_]*)/i)
  return match?.[1] || null
}

const appendReturningId = (sql) => {
  if (!getInsertTable(sql) || /\bRETURNING\b/i.test(sql)) return sql
  return `${sql} RETURNING id`
}

let sqlite
let pool
let readyPromise

const createSqliteAdapter = () => {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  sqlite = sqlite || new Database(dbPath)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      tags TEXT NOT NULL DEFAULT '[]',
      imageUrl TEXT NOT NULL DEFAULT '',
      discountEnabled INTEGER NOT NULL DEFAULT 0,
      discountPercent INTEGER NOT NULL DEFAULT 0,
      discountStart TEXT,
      discountEnd TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      method TEXT NOT NULL,
      reference TEXT NOT NULL,
      status TEXT NOT NULL,
      receiptPath TEXT,
      failureReason TEXT,
      verifiedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      shippingAddress TEXT NOT NULL,
      subtotal REAL NOT NULL,
      deliveryFee REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      paymentId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(paymentId) REFERENCES payments(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      name TEXT NOT NULL,
      imageUrl TEXT,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      FOREIGN KEY(orderId) REFERENCES orders(id),
      FOREIGN KEY(productId) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      orderId INTEGER,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(orderId) REFERENCES orders(id)
    );
  `)

  return {
    prepare(sql) {
      const statement = sqlite.prepare(sql)
      return {
        all: async (...params) => statement.all(...params),
        get: async (...params) => statement.get(...params),
        run: async (...params) => statement.run(...params),
      }
    },
  }
}

const createPostgresAdapter = async () => {
  pool =
    pool ||
    new Pool({
      connectionString: databaseUrl,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    })

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      tags TEXT NOT NULL DEFAULT '[]',
      imageUrl TEXT NOT NULL DEFAULT '',
      discountEnabled INTEGER NOT NULL DEFAULT 0,
      discountPercent INTEGER NOT NULL DEFAULT 0,
      discountStart TEXT,
      discountEnd TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      method TEXT NOT NULL,
      reference TEXT NOT NULL,
      status TEXT NOT NULL,
      receiptPath TEXT,
      failureReason TEXT,
      verifiedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      userId INTEGER,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      shippingAddress TEXT NOT NULL,
      subtotal DOUBLE PRECISION NOT NULL,
      deliveryFee DOUBLE PRECISION NOT NULL,
      total DOUBLE PRECISION NOT NULL,
      status TEXT NOT NULL,
      paymentId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      name TEXT NOT NULL,
      imageUrl TEXT,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      userId INTEGER,
      orderId INTEGER,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `)

  return {
    prepare(sql) {
      return {
        all: async (...params) => {
          const result = await pool.query(toPostgresSql(sql), params)
          return normalizeRows(result.rows)
        },
        get: async (...params) => {
          const result = await pool.query(toPostgresSql(sql), params)
          return normalizeRow(result.rows[0])
        },
        run: async (...params) => {
          const result = await pool.query(toPostgresSql(appendReturningId(sql)), params)
          return {
            changes: result.rowCount,
            lastInsertRowid: result.rows[0]?.id,
          }
        },
      }
    },
  }
}

const createAdminIfMissing = async (db) => {
  const row = await db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin')
  if (!row) {
    const passwordHash = '$2a$10$EOmkXuD9ushBrvRmNAAiWOmpejHTjs/KP7UNr62hv9LwkPOjSnErm' // password: Admin123!
    const now = new Date().toISOString()
    await db
      .prepare('INSERT INTO users (name, email, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run('Admin', 'admin@henryme.store', passwordHash, 'admin', now)
  }
}

const initializeDb = async () => {
  const adapter = isPostgres ? await createPostgresAdapter() : createSqliteAdapter()
  await createAdminIfMissing(adapter)
  return adapter
}

export const getDb = async () => {
  readyPromise = readyPromise || initializeDb()
  return readyPromise
}

export const parseProduct = (row) => {
  const discountEnabled = Boolean(row.discountEnabled)
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
    discountEnabled,
    image: row.imageUrl || row.image || '',
    discount: {
      enabled: discountEnabled,
      percent: Number(row.discountPercent || 0),
      start: row.discountStart || '',
      end: row.discountEnd || '',
    },
  }
}

export const parseOrder = (row) => ({
  ...row,
  shippingAddress: JSON.parse(row.shippingAddress || '{}'),
})
