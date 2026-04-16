import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import RatingStars from '../components/ui/RatingStars.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'
import { useCart } from '../context/CartContext.jsx'
import { ArrowLeftIcon, MinusIcon, PlusIcon } from '../components/ui/Icons.jsx'
import { useProducts } from '../context/ProductsContext.jsx'
import { getDiscountedPrice, isDiscountActive } from '../utils/discounts.js'

const sizes = ['XS', 'S', 'M', 'L', 'XL']

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { products } = useProducts()
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)

  const product = useMemo(
    () => products.find((item) => String(item.id) === id),
    [id, products],
  )

  if (!product) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted">Product not found.</p>
        <Link to="/home" className="mt-4 inline-block text-sm font-semibold">
          Back to shop
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem(product, { size: selectedSize, quantity })
  }

  const handleCheckout = () => {
    addItem(product, { size: selectedSize, quantity })
    navigate('/checkout')
  }

  const availableStock =
    typeof product?.stock === 'number' ? Math.max(product.stock, 0) : null
  const isOutOfStock = availableStock !== null && availableStock <= 0

  useEffect(() => {
    if (availableStock === null) return
    if (availableStock <= 0) {
      setQuantity(1)
      return
    }
    setQuantity((prev) => Math.min(prev, availableStock))
  }, [availableStock])

  return (
    <div className="page-transition">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted"
      >
        <ArrowLeftIcon size={18} /> Back
      </button>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-[#F6F6F6]">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-muted">Product Image</span>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">
              Home / Shop / {product.name}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-primary">
              {product.name}
            </h1>
            <RatingStars rating={4.5} className="mt-2" />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-semibold">
                {formatCurrency(getDiscountedPrice(product) ?? product.price)}
              </p>
              {isDiscountActive(product) && product.discount?.percent ? (
                <>
                  <span className="text-sm text-muted line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="rounded-full bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    -{product.discount.percent}%
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <p className="text-sm text-muted">
            Premium quality cotton t-shirt with a classic fit. Perfect for everyday
            wear.
          </p>
          {availableStock !== null && (
            <p className="text-sm text-muted">
              {isOutOfStock ? 'Out of stock' : `In stock: ${availableStock}`}
            </p>
          )}

          <div>
            <p className="text-sm font-semibold">Select Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition focus-ring ${
                    selectedSize === size
                      ? 'bg-black text-white'
                      : 'border border-border text-primary hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Quantity</p>
            <div className="mt-3 inline-flex items-center gap-3 rounded-lg border border-border px-3 py-2">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="rounded-md border border-border p-1.5 transition hover:border-primary focus-ring"
              >
                <MinusIcon size={14} />
              </button>
              <span className="min-w-[24px] text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((prev) => {
                    if (availableStock === null) return prev + 1
                    return Math.min(prev + 1, availableStock)
                  })
                }
                className="rounded-md border border-border p-1.5 transition hover:border-primary focus-ring"
              >
                <PlusIcon size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="w-full sm:flex-1"
              variant="outline"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              Add to cart
            </Button>
            <Button
              className="w-full sm:flex-1"
              onClick={handleCheckout}
              disabled={isOutOfStock}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
