import { useEffect, useMemo, useRef, useState } from 'react'
import cn from '../../utils/cn.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import Modal from './Modal.jsx'

const notificationCopy = {
  order_new: {
    title: 'New order received',
    subtitle: 'A new order is waiting to be fulfilled.',
  },
  payment_verified: {
    title: 'Payment verified',
    subtitle: 'Bank transfer has been verified.',
  },
  payment_failed: {
    title: 'Payment verification failed',
    subtitle: 'Transfer could not be verified yet.',
  },
  order_fulfilled: {
    title: 'Order fulfilled',
    subtitle: 'Order has been marked as fulfilled.',
  },
  order_cancelled: {
    title: 'Order cancelled',
    subtitle: 'Order has been cancelled.',
  },
}

const formatDateTime = (value) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const NotificationsPanel = ({
  open,
  onClose,
  className = '',
  panelId,
  notifications = [],
  orders = [],
}) => {
  const panelRef = useRef(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId),
    [orders, selectedOrderId],
  )

  useEffect(() => {
    if (!open) {
      setSelectedOrderId(null)
    }
  }, [open])
  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort((a, b) => {
        const aTime = new Date(a.createdAt || a.time || 0).getTime()
        const bTime = new Date(b.createdAt || b.time || 0).getTime()
        return bTime - aTime
      }),
    [notifications],
  )

  useEffect(() => {
    if (!open) return

    const handleClick = (event) => {
      if (!panelRef.current) return
      if (!panelRef.current.contains(event.target)) {
        onClose?.()
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-label="Notifications"
        className={cn(
          'fixed left-4 right-4 top-16 w-auto rounded-xl border border-border bg-white p-4 shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-72',
          className,
        )}
      >
        <p className="text-sm font-semibold text-primary">Notifications</p>
        {sortedNotifications.length === 0 ? (
          <p className="mt-2 text-xs text-muted">No new notifications yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {sortedNotifications.map((notification) => {
              const order = orders.find(
                (item) => item.id === notification.orderId,
              )
              const copy = notificationCopy[notification.type] || {
                title: 'Order update',
                subtitle: 'There is an update on an order.',
              }
              return (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedOrderId(notification.orderId)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      setSelectedOrderId(notification.orderId)
                    }
                  }}
                  className="rounded-lg border border-border p-3 text-xs text-muted transition hover:border-primary focus-ring"
                >
                  <p className="text-xs font-semibold text-primary">
                    {copy.title}
                  </p>
                  <p className="mt-1">
                    Order #{String(notification.orderId || '').padStart(3, '0')} •{' '}
                    {order?.items?.reduce(
                      (sum, item) => sum + (item.quantity || 0),
                      0,
                    ) || 0}{' '}
                    items •{' '}
                    {formatCurrency(order?.total ?? order?.summary?.total ?? 0)}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">
                    {formatDateTime(notification.createdAt)}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">{copy.subtitle}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
        className="max-w-lg"
      >
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Order Details
                </p>
                <h3 className="mt-2 text-xl font-semibold text-primary">
                  Order #{String(selectedOrder.id).padStart(3, '0')}
                </h3>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
                {selectedOrder.status}
              </span>
            </div>

            <div className="text-xs text-muted">
              <p>
                Customer:{' '}
                <span className="font-semibold text-primary">
                  {selectedOrder.customer?.name || 'Guest'}
                </span>
              </p>
              {selectedOrder.customer?.email ? (
                <p>{selectedOrder.customer.email}</p>
              ) : null}
              <p className="mt-1">
                Placed on {formatDateTime(selectedOrder.createdAt)}
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-border p-4">
              {selectedOrder.items?.map((item) => (
                <div
                  key={`${selectedOrder.id}-${item.productId ?? item.id ?? item.name}`}
                  className="flex items-start justify-between text-sm"
                >
                  <div>
                    <p className="font-semibold text-primary">{item.name}</p>
                    <p className="text-xs text-muted">
                      Size: {item.size || 'M'} • Qty: {item.quantity || 0}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency(
                      (item.unitPrice ?? item.price ?? 0) * (item.quantity || 0),
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted">
                <span>Subtotal</span>
                <span>
                  {formatCurrency(
                    selectedOrder.subtotal ?? selectedOrder.summary?.subtotal ?? 0,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Delivery</span>
                <span>
                  {formatCurrency(
                    selectedOrder.deliveryFee ??
                      selectedOrder.summary?.deliveryFee ??
                      0,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>
                  {formatCurrency(
                    selectedOrder.total ?? selectedOrder.summary?.total ?? 0,
                  )}
                </span>
              </div>
            </div>

            {selectedOrder.payment?.method ? (
              <div className="rounded-xl border border-border p-4 text-xs text-muted">
                <p className="text-xs uppercase tracking-[0.2em]">
                  Payment
                </p>
                <p className="mt-2">
                  Method:{' '}
                  <span className="font-semibold text-primary">
                    {selectedOrder.payment.method}
                  </span>
                </p>
                {selectedOrder.payment.reference ? (
                  <p className="mt-1">
                    Reference: {selectedOrder.payment.reference}
                  </p>
                ) : null}
                {selectedOrder.payment.status ? (
                  <p className="mt-1">Status: {selectedOrder.payment.status}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-muted">Order details not available.</div>
        )}
      </Modal>
    </>
  )
}

export default NotificationsPanel
