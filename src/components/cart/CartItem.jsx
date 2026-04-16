import { MinusIcon, PlusIcon, TrashIcon } from "../ui/Icons.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import RatingStars from "../ui/RatingStars.jsx";
import { getDiscountedPrice, isDiscountActive } from "../../utils/discounts.js";

const CartItem = ({ item, onRemove, onUpdate }) => {
  const discountedPrice = getDiscountedPrice(item.product);
  const hasDiscount =
    isDiscountActive(item.product) && discountedPrice !== null;

  return (
    <div className="flex flex-col gap-4 border-b border-border py-4 sm:flex-row sm:items-center">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-border bg-[#F6F6F6]">
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
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-primary">
              {item.product.name}
            </p>
            <RatingStars rating={4.5} className="mt-1" />
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">
                {formatCurrency(
                  hasDiscount ? discountedPrice : item.product.price,
                )}
              </span>
              {hasDiscount ? (
                <span className="text-xs text-muted line-through">
                  {formatCurrency(item.product.price)}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted">Size: {item.size}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-border p-2 text-muted transition hover:border-primary hover:text-primary focus-ring"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onUpdate(item.quantity - 1)}
          className="rounded-lg border border-border p-2 transition hover:border-primary focus-ring"
        >
          <MinusIcon size={14} />
        </button>
        <span className="min-w-[24px] text-center text-sm font-semibold">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onUpdate(item.quantity + 1)}
          className="rounded-lg border border-border p-2 transition hover:border-primary focus-ring"
        >
          <PlusIcon size={14} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
