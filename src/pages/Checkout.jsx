import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import { MinusIcon, PlusIcon } from '../components/ui/Icons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useOrders } from '../context/OrdersContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'
import { getDiscountedPrice, getEffectivePrice, isDiscountActive } from '../utils/discounts.js'

const Checkout = () => {
  const navigate = useNavigate()
  const { items, subtotal, deliveryFee, total, updateQuantity } = useCart()
  const { addOrder } = useOrders()
  const { user } = useAuth()

  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptName, setReceiptName] = useState('')

  const referenceRef = useRef(
    `HM-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`,
  )

  const amountToPay = useMemo(() => total, [total])

  if (!items.length) {
    return (
      <div className="page-transition flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-sm text-muted">Add products to your cart first.</p>
        <Button onClick={() => navigate('/home')}>Browse Shop</Button>
      </div>
    )
  }

  const handleReceiptChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setReceiptName(file.name)
  }

  const handlePayNow = () => {
    if (isProcessing) return
    setIsProcessing(true)

    const paymentPayload = {
      method: 'Bank Transfer',
      beneficiary: 'Henry Awa',
      bank: 'Moniepoint',
      accountName: 'Henry Eyinnaya Awa',
      accountNumber: '8062098161',
      reference: referenceRef.current,
      status: 'Pending Verification',
      receiptName: receiptName || '',
    }

    const orderItems = items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      image: item.product.image,
      size: item.size,
      quantity: item.quantity,
      unitPrice: getEffectivePrice(item.product),
    }))

    const createdId = addOrder({
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      customer: {
        name: user?.name || 'Guest',
        email: user?.email || '',
      },
      status: 'Pending',
      payment: paymentPayload,
    })

    setIsProcessing(false)
    navigate(`/payment-pending/${createdId}`)
  }

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
            <h2 className="text-lg font-semibold">Payment Method</h2>
            <p className="mt-2 text-sm text-muted">
              Bank transfer is the only available method for now.
            </p>

            <div className="mt-4 rounded-2xl border border-border bg-[#F6F6F6] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    Bank Transfer : Henry Awa
                  </p>
                  <p className="mt-1 text-base font-semibold">Henry Awa</p>
                </div>
                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                  {formatCurrency(amountToPay)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">Bank</p>
                  <p className="mt-1 font-semibold text-primary">Moniepoint</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">Account Number</p>
                  <p className="mt-1 font-semibold text-primary">8062098161</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">Account Name</p>
                  <p className="mt-1 font-semibold text-primary">
                    Henry Eyinnaya Awa
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">Reference</p>
                  <p className="mt-1 font-semibold text-primary">
                    {referenceRef.current}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted">
                Use the reference above to help us match your transfer. Verification
                usually takes a few minutes.
              </p>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-primary">
                Upload transfer receipt (optional)
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptChange}
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-ring"
                />
              </label>
              {receiptName ? (
                <p className="mt-2 text-xs text-muted">Attached: {receiptName}</p>
              ) : null}
            </div>

            <div className="mt-4 rounded-lg border border-border bg-white px-4 py-3 text-xs text-muted">
              You&apos;ll be taken to a verification screen after confirming your
              transfer.
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
            <Button full className="mt-6" onClick={handlePayNow} disabled={isProcessing}>
              {isProcessing ? 'Verifying Transfer...' : 'I have made transfer'}
            </Button>
            <p className="mt-3 text-xs text-muted">
              We&apos;ll verify your transfer and notify you shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
