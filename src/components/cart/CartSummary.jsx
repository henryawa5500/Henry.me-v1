import { formatCurrency } from '../../utils/formatCurrency.js'

const CartSummary = ({ subtotal, deliveryFee, total }) => (
  <div className="surface-panel rounded-2xl p-6">
    <h3 className="text-lg font-semibold">Order Summary</h3>
    <div className="mt-4 space-y-3 text-sm">
      <div className="flex items-center justify-between text-muted">
        <span>Sub Total</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between text-muted">
        <span>Delivery Fee</span>
        <span>{formatCurrency(deliveryFee)}</span>
      </div>
      <div className="flex items-center justify-between text-base font-semibold">
        <span>TOTAL</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  </div>
)

export default CartSummary

