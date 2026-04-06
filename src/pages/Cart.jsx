import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import CartItem from '../components/cart/CartItem.jsx'
import CartSummary from '../components/cart/CartSummary.jsx'
import { useCart } from '../context/CartContext.jsx'

const Cart = () => {
  const navigate = useNavigate()
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    updateQuantity,
    removeItem,
    itemCount,
  } = useCart()

  if (!items.length) {
    return (
      <div className="page-transition flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-sm text-muted">Start adding tees to your cart.</p>
        <Button onClick={() => navigate('/home')}>Go to Shop</Button>
      </div>
    )
  }

  return (
    <div className="page-transition">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cart</h1>
          <p className="text-xs text-muted">{itemCount} item(s)</p>
        </div>
        <Link to="/home" className="text-sm font-medium text-muted">
          Continue Shopping
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
            {items.map((item) => (
              <CartItem
                key={`${item.product.id}-${item.size}`}
                item={item}
                onRemove={() => removeItem(item.product.id, item.size)}
                onUpdate={(qty) => updateQuantity(item.product.id, qty, item.size)}
              />
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Shipping Address</p>
                <p className="mt-1 text-sm text-muted">
                  21B Adeola Odeku Street, Victoria Island, Lagos
                </p>
              </div>
              <button type="button" className="text-xs font-semibold text-primary focus-ring">
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <CartSummary
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
          />
          <div className="mt-4 space-y-3">
            <Button variant="outline" full onClick={() => navigate('/home')}>
              Continue Shopping
            </Button>
            <Button full onClick={() => navigate('/checkout')}>
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

