export const formatCurrency = (value) => {
  if (Number.isNaN(Number(value))) return '?0.00'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(value)
}

