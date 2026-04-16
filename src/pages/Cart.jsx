import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import CartItem from '../components/cart/CartItem.jsx'
import CartSummary from '../components/cart/CartSummary.jsx'
import Input from '../components/ui/Input.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'
import { useCart } from '../context/CartContext.jsx'
import { useAddress } from '../context/AddressContext.jsx'

const Cart = () => {
  const navigate = useNavigate()
  const { address, hasAddress, saveAddress } = useAddress()
  const [isEditingAddress, setIsEditingAddress] = useState(!hasAddress)
  const [draftAddress, setDraftAddress] = useState(address)
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    updateQuantity,
    removeItem,
    itemCount,
  } = useCart()

  useEffect(() => {
    setDraftAddress(address)
    if (!hasAddress) {
      setIsEditingAddress(true)
    }
  }, [address, hasAddress])

  const handleAddressChange = (key) => (event) => {
    setDraftAddress((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleSaveAddress = () => {
    saveAddress(draftAddress)
    setIsEditingAddress(false)
  }

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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Shipping Address</p>
                {!isEditingAddress ? (
                  <p className="mt-1 text-sm text-muted">
                    {address.fullName ? `${address.fullName} • ` : ''}
                    {address.phone ? `${address.phone} • ` : ''}
                    {address.addressLine}, {address.city}, {address.state}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted">
                    Provide a delivery address for your order.
                  </p>
                )}
                {!isEditingAddress ? (
                  <p className="mt-2 text-xs text-muted">
                    Delivery fee: {formatCurrency(deliveryFee)} for{' '}
                    {address.state || 'Lagos'}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setIsEditingAddress((prev) => !prev)}
                className="text-xs font-semibold text-primary focus-ring"
              >
                {isEditingAddress ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditingAddress && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  value={draftAddress.fullName}
                  onChange={handleAddressChange('fullName')}
                  placeholder="Henry Awa"
                />
                <Input
                  label="Phone number"
                  value={draftAddress.phone}
                  onChange={handleAddressChange('phone')}
                  placeholder="+234 800 000 0000"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Address line"
                    value={draftAddress.addressLine}
                    onChange={handleAddressChange('addressLine')}
                    placeholder="21B Adeola Odeku Street"
                  />
                </div>
                <Input
                  label="City"
                  value={draftAddress.city}
                  onChange={handleAddressChange('city')}
                  placeholder="Lagos"
                />
                <Input
                  label="State"
                  value={draftAddress.state}
                  onChange={handleAddressChange('state')}
                  placeholder="Lagos"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Delivery notes (optional)"
                    value={draftAddress.notes}
                    onChange={handleAddressChange('notes')}
                    placeholder="Landmark, gate code, etc."
                  />
                </div>
                <div className="sm:col-span-2 flex flex-wrap gap-3">
                  <Button onClick={handleSaveAddress}>Save Address</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDraftAddress(address)
                      setIsEditingAddress(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
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
