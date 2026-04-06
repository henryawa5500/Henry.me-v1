import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency.js'
import { useCart } from '../../context/CartContext.jsx'
import Button from './Button.jsx'
import { getDiscountedPrice, isDiscountActive } from '../../utils/discounts.js'

const ProductCard = ({ product }) => {
  const { addItem } = useCart()

  const discountedPrice = getDiscountedPrice(product)
  const hasDiscount = isDiscountActive(product) && discountedPrice !== null

  return (
    <div className="group rounded-xl border border-border bg-white p-3 transition hover:-translate-y-1 hover:shadow-md">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-[#F6F6F6]">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-xs text-muted">Image</span>
          )}
          {product.tags?.[0] && (
            <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              {product.tags[0]}
            </span>
          )}
          {hasDiscount && product.discount?.percent ? (
            <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              -{product.discount.percent}%
            </span>
          ) : null}
        </div>
        <div className="mt-3">
          <p className="text-sm font-semibold text-primary">{product.name}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-primary">
              {formatCurrency(hasDiscount ? discountedPrice : product.price)}
            </span>
            {hasDiscount ? (
              <span className="text-xs text-muted line-through">
                {formatCurrency(product.price)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full lg:opacity-0 lg:group-hover:opacity-100"
        onClick={() => addItem(product)}
      >
        Add to Cart
      </Button>
    </div>
  )
}

export default ProductCard
