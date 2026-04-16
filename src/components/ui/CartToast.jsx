import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'

const CartToast = () => {
  const { lastAddedItem, clearLastAddedItem } = useCart()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!lastAddedItem) return
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      clearLastAddedItem()
    }, 2600)

    return () => clearTimeout(timer)
  }, [lastAddedItem, clearLastAddedItem])

  if (!visible || !lastAddedItem) return null

  const { product, size, quantity } = lastAddedItem

  return (
    <div className="fixed bottom-28 left-4 right-4 z-50 rounded-xl border border-border bg-white p-4 shadow-lg sm:bottom-6 sm:left-auto sm:right-6 sm:w-[320px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Added to cart</p>
          <p className="mt-1 text-xs text-muted">
            {product?.name} • {size} • Qty {quantity}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false)
            clearLastAddedItem()
          }}
          className="rounded-full border border-border px-2 py-0.5 text-xs text-muted transition hover:border-primary focus-ring"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="mt-3">
        <Link
          to="/cart"
          className="inline-flex w-full items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary focus-ring"
        >
          View cart
        </Link>
      </div>
    </div>
  )
}

export default CartToast
