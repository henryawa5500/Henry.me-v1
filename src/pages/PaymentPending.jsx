import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import { useOrders } from '../context/OrdersContext.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'

const getPaymentState = (status) => {
  if (status === 'Verified') return 'success'
  if (status === 'Verification Failed') return 'failed'
  return 'pending'
}

const statusConfig = {
  pending: {
    title: 'Payment pending verification',
    description:
      'Your transfer is waiting for admin approval. This usually takes a few minutes.',
    classes: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  },
  failed: {
    title: 'Verification failed',
    description:
      'We could not confirm this transfer yet. You can retry after confirming the reference.',
    classes: 'border-red-200 bg-red-50 text-red-700',
  },
  success: {
    title: 'Payment verified',
    description: 'Your payment is confirmed. You can complete your order now.',
    classes: 'border-green-200 bg-green-50 text-green-700',
  },
}

const PaymentPending = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { orders, markPaymentFailed, markPaymentPending } = useOrders()

  const order = useMemo(
    () => orders.find((item) => String(item.id) === String(id)),
    [orders, id],
  )

  const paymentState = getPaymentState(order?.payment?.status)
  const statusMeta = statusConfig[paymentState]
  const subtotal = order?.subtotal ?? order?.summary?.subtotal ?? 0
  const deliveryFee = order?.deliveryFee ?? order?.summary?.deliveryFee ?? 0
  const total = order?.total ?? order?.summary?.total ?? 0

  useEffect(() => {
    if (!order) return
    if (order.payment?.status !== 'Pending Verification') return

    const timer = setTimeout(() => {
      markPaymentFailed(
        order.id,
        'Verification timed out. Please retry or contact support.',
      )
    }, 12000)

    return () => clearTimeout(timer)
  }, [order, markPaymentFailed])

  if (!order) {
    return (
      <div className="page-transition flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Payment Status</h1>
        <p className="text-sm text-muted">
          We could not find that order. Start checkout again.
        </p>
        <Button onClick={() => navigate('/checkout')}>Back to Checkout</Button>
      </div>
    )
  }

  return (
    <div className="page-transition space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payment Status</h1>
        <Link to="/cart" className="text-sm font-medium text-muted focus-ring">
          Back to cart
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Order #{String(order.id).padStart(3, '0')}
            </p>
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${statusMeta.classes}`}
            >
              <p className="font-semibold">{statusMeta.title}</p>
              <p className="mt-1 text-xs">{statusMeta.description}</p>
              {order.payment?.failureReason ? (
                <p className="mt-2 text-xs">Reason: {order.payment.failureReason}</p>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-[#F6F6F6] p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Bank Transfer
              </p>
              <p className="mt-2 font-semibold">{order.payment?.beneficiary || 'Henry Awa'}</p>
              <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
                <p>Bank: {order.payment?.bank || 'Moniepoint'}</p>
                <p>Account: {order.payment?.accountNumber || '8062098161'}</p>
                <p>Name: {order.payment?.accountName || 'Henry Eyinnaya Awa'}</p>
                <p>Reference: {order.payment?.reference || '-'}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {paymentState === 'failed' ? (
                <Button onClick={() => markPaymentPending(order.id)}>
                  Retry Verification
                </Button>
              ) : null}
              {paymentState === 'success' ? (
                <Button
                  onClick={() =>
                    navigate('/order-complete', { state: { orderId: order.id } })
                  }
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate('/order-complete', { state: { orderId: order.id } })
                  }
                  disabled
                >
                  Waiting for verification
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold">Order Total</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted">
                <span>Order</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Delivery</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Summary</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPending
