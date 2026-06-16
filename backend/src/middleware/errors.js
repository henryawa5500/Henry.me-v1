export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500
  const message = err.expose ? err.message : 'An internal error occurred'
  if (status === 500) {
    console.error(err)
  }
  res.status(status).json({ error: message })
}

export const notFound = (req, res) => {
  res.status(404).json({ error: 'Resource not found' })
}
