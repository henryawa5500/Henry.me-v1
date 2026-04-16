import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import { ArrowLeftIcon } from '../components/ui/Icons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useOrders } from '../context/OrdersContext.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'

const OrderComplete = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { subtotal, deliveryFee, total, clearCart } = useCart()
  const { orders } = useOrders()

  const orderId = location.state?.orderId
  const order = useMemo(
    () => orders.find((item) => item.id === orderId),
    [orders, orderId],
  )

  const resolvedSubtotal = order?.subtotal ?? order?.summary?.subtotal ?? subtotal
  const resolvedDeliveryFee =
    order?.deliveryFee ?? order?.summary?.deliveryFee ?? deliveryFee
  const resolvedTotal = order?.total ?? order?.summary?.total ?? total

  if (order && order.payment?.status !== 'Verified') {
    return (
      <div className="page-transition flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Payment not verified yet</h1>
        <p className="text-sm text-muted">
          Complete payment verification before finalizing this order.
        </p>
        <Button onClick={() => navigate(`/payment-pending/${order.id}`)}>
          Back to Payment Status
        </Button>
      </div>
    )
  }

  const handleContinue = () => {
    clearCart()
    navigate('/home')
  }

  return (
    <div className="page-transition min-h-screen bg-white px-4 py-10 sm:bg-surface sm:px-6">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted focus-ring"
        >
          <ArrowLeftIcon size={18} /> Back
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <circle cx="40" cy="40" r="38" stroke="#E0E0E0" strokeWidth="2" />
            <path
              d="M20 40c6-14 34-14 40 0"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M40 26v28"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M34 54h12"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div>
            <h1 className="text-2xl font-semibold">Order completed!</h1>
            <p className="mt-2 text-sm text-muted">
              Your payment has been verified and your order is confirmed.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between text-muted">
            <span>Order</span>
            <span>{formatCurrency(resolvedSubtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Delivery</span>
            <span>{formatCurrency(resolvedDeliveryFee)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Summary</span>
            <span>{formatCurrency(resolvedTotal)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            full
            variant="outline"
            onClick={() => (order ? navigate(`/payment-pending/${order.id}`) : navigate('/cart'))}
          >
            Order Details
          </Button>
          <Button full onClick={handleContinue}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderComplete
