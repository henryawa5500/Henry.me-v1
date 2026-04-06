import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import BottomSheet from '../components/ui/BottomSheet.jsx'
import Modal from '../components/ui/Modal.jsx'
import { CardIcon, MinusIcon, PlusIcon } from '../components/ui/Icons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'
import useMediaQuery from '../utils/useMediaQuery.js'
import { getDiscountedPrice, isDiscountActive } from '../utils/discounts.js'
import { useOrders } from '../context/OrdersContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getEffectivePrice } from '../utils/discounts.js'

const formatCardNumber = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})/g, '$1 ')
    .trim()

const Checkout = () => {
  const navigate = useNavigate()
  const { items, subtotal, deliveryFee, total, updateQuantity } = useCart()
  const { addOrder } = useOrders()
  const { user } = useAuth()
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardholder, setCardholder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  if (!items.length) {
    return (
      <div className="page-transition flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-sm text-muted">Add products to your cart first.</p>
        <Button onClick={() => navigate('/home')}>Browse Shop</Button>
      </div>
    )
  }

  const handlePayNow = () => {
    const orderItems = items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      image: item.product.image,
      size: item.size,
      quantity: item.quantity,
      unitPrice: getEffectivePrice(item.product),
    }))

    addOrder({
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      customer: {
        name: user?.name || 'Guest',
        email: user?.email || '',
      },
      status: 'Pending',
    })

    setShowAddCard(false)
    navigate('/order-complete')
  }

  const cardForm = (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Add New Card</h3>
      <label className="block text-sm font-medium">
        Cardholder name
        <input
          value={cardholder}
          onChange={(event) => setCardholder(event.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-border px-4 text-sm focus-ring"
          placeholder="Henry Me"
        />
      </label>
      <label className="block text-sm font-medium">
        Card number
        <input
          value={cardNumber}
          onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
          className="mt-2 h-11 w-full rounded-lg border border-border px-4 text-sm focus-ring"
          placeholder="1234 5678 9012 3456"
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Expiry
          <input
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-border px-4 text-sm focus-ring"
            placeholder="09/27"
          />
        </label>
        <label className="block text-sm font-medium">
          CVV
          <input
            value={cvv}
            onChange={(event) => setCvv(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-border px-4 text-sm focus-ring"
            placeholder="***"
          />
        </label>
      </div>
      <Button full onClick={handlePayNow}>
        Pay Now
      </Button>
    </div>
  )

  return (
    <div className="page-transition">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <Link to="/cart" className="text-sm font-medium text-muted focus-ring">
          Back to cart
        </Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold">Product Summary</h2>
            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-border bg-[#F6F6F6]">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted">Image</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.product.name}</p>
                    <p className="mt-1 text-xs text-muted">Size: {item.size}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold">
                        {formatCurrency(
                          getDiscountedPrice(item.product) ?? item.product.price,
                        )}
                      </span>
                      {isDiscountActive(item.product) &&
                      getDiscountedPrice(item.product) ? (
                        <span className="text-xs text-muted line-through">
                          {formatCurrency(item.product.price)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1, item.size)
                      }
                      className="rounded-lg border border-border p-2 transition hover:border-primary focus-ring"
                    >
                      <MinusIcon size={14} />
                    </button>
                    <span className="min-w-[24px] text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1, item.size)
                      }
                      className="rounded-lg border border-border p-2 transition hover:border-primary focus-ring"
                    >
                      <PlusIcon size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Payment</h2>
              <button
                type="button"
                onClick={() => setShowAddCard(true)}
                className="text-sm font-semibold text-primary focus-ring"
              >
                + Add New Card
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-black p-5 text-white">
              <div className="flex items-center justify-between">
                <CardIcon className="text-white" />
                <span className="text-xs uppercase tracking-[0.2em]">VISA</span>
              </div>
              <p className="mt-6 text-lg tracking-[0.2em]">**** **** **** 2095</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <div>
                  <p className="text-white/60">Cardholder</p>
                  <p className="font-semibold">Henry Me</p>
                </div>
                <div>
                  <p className="text-white/60">Expiry</p>
                  <p className="font-semibold">09/27</p>
                </div>
              </div>
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
            <Button full className="mt-6" onClick={handlePayNow}>
              Pay Now
            </Button>
          </div>
        </div>
      </div>

      {showAddCard && !isDesktop && (
        <BottomSheet open={showAddCard} onClose={() => setShowAddCard(false)}>
          {cardForm}
        </BottomSheet>
      )}

      {showAddCard && isDesktop && (
        <Modal open={showAddCard} onClose={() => setShowAddCard(false)}>
          {cardForm}
        </Modal>
      )}
    </div>
  )
}

export default Checkout
