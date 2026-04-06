export const getDiscountStatus = (product, now = new Date()) => {
  const discount = product?.discount
  if (!discount?.enabled) return 'Off'

  const hasStart = Boolean(discount.start)
  const hasEnd = Boolean(discount.end)

  if (!hasStart && !hasEnd) return 'Enabled'

  const start = hasStart ? new Date(`${discount.start}T00:00:00`) : null
  const end = hasEnd ? new Date(`${discount.end}T23:59:59`) : null

  if (start && now < start) return 'Scheduled'
  if (end && now > end) return 'Expired'
  return 'Active'
}

export const isDiscountActive = (product, now = new Date()) => {
  const status = getDiscountStatus(product, now)
  return status === 'Active' || status === 'Enabled'
}

export const getDiscountedPrice = (product, now = new Date()) => {
  if (!product) return null
  if (!isDiscountActive(product, now)) return null
  const percent = Number(product?.discount?.percent)
  if (!percent || percent <= 0) return null
  const basePrice = Number(product.price)
  if (Number.isNaN(basePrice)) return null
  return Math.max(0, basePrice * (1 - percent / 100))
}

export const getEffectivePrice = (product, now = new Date()) =>
  getDiscountedPrice(product, now) ?? Number(product?.price ?? 0)
