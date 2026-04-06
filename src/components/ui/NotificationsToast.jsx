import { useEffect, useMemo, useState } from 'react'
import { useOrders } from '../../context/OrdersContext.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'

const toastCopy = {
  order_new: 'New order received',
  order_fulfilled: 'Order fulfilled',
  order_cancelled: 'Order cancelled',
}

const NotificationsToast = () => {
  const { latestNotification, dismissLatestNotification, orders } = useOrders()
  const [visible, setVisible] = useState(false)

  const order = useMemo(() => {
    if (!latestNotification) return null
    return orders.find((item) => item.id === latestNotification.orderId)
  }, [latestNotification, orders])

  useEffect(() => {
    if (!latestNotification) return
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      dismissLatestNotification()
    }, 3500)
    return () => clearTimeout(timer)
  }, [latestNotification, dismissLatestNotification])

  if (!latestNotification || !visible) return null

  const title = toastCopy[latestNotification.type] || 'Order update'
  const total = order?.total ?? order?.summary?.total ?? 0
  const itemsCount =
    order?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

  return (
    <div className="fixed bottom-24 right-4 z-50 w-[280px] rounded-xl border border-border bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-primary">{title}</p>
          <p className="mt-1 text-xs text-muted">
            Order #{String(latestNotification.orderId || '').padStart(3, '0')} •{' '}
            {itemsCount} items • {formatCurrency(total)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setVisible(false)
            dismissLatestNotification()
          }}
          className="rounded-full border border-border px-2 py-0.5 text-xs text-muted transition hover:border-primary focus-ring"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default NotificationsToast
