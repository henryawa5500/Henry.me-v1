/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import { getEffectivePrice } from '../utils/discounts.js'
import { calculateDeliveryFee } from '../utils/shipping.js'
import { useAddress } from './AddressContext.jsx'

const CartContext = createContext(null)

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const { address } = useAddress()
  const [items, setItems] = useState([])
  const [lastAddedItem, setLastAddedItem] = useState(null)

  const addItem = (product, options = {}) => {
    const size = options.size || 'M'
    const quantityToAdd = options.quantity || 1
    const maxStock =
      typeof product?.stock === 'number' ? Math.max(product.stock, 0) : null
    if (maxStock !== null && maxStock <= 0) return
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size,
      )
      if (existingIndex >= 0) {
        return prev.map((item, index) => {
          if (index !== existingIndex) return item
          const nextQuantity =
            maxStock === null
              ? item.quantity + quantityToAdd
              : Math.min(item.quantity + quantityToAdd, maxStock)
          if (nextQuantity > item.quantity) {
            setLastAddedItem({
              product,
              size,
              quantity: nextQuantity - item.quantity,
              time: Date.now(),
            })
          }
          return { ...item, quantity: nextQuantity }
        })
      }
      const initialQuantity =
        maxStock === null ? quantityToAdd : Math.min(quantityToAdd, maxStock)
      if (initialQuantity > 0) {
        setLastAddedItem({
          product,
          size,
          quantity: initialQuantity,
          time: Date.now(),
        })
      }
      return [...prev, { product, size, quantity: initialQuantity }]
    })
  }

  const removeItem = (id, size = 'M') => {
    setItems((prev) =>
      prev.filter((item) => !(item.product.id === id && item.size === size)),
    )
  }

  const updateQuantity = (id, quantity, size = 'M') => {
    const maxStock =
      typeof items.find(
        (item) => item.product.id === id && item.size === size,
      )?.product?.stock === 'number'
        ? Math.max(
            items.find((item) => item.product.id === id && item.size === size)
              ?.product?.stock ?? 0,
            0,
          )
        : null
    const nextQuantity =
      maxStock === null ? quantity : Math.min(quantity, maxStock)
    if (nextQuantity <= 0) {
      removeItem(id, size)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === id && item.size === size
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    )
  }

  const clearCart = () => setItems([])
  const clearLastAddedItem = () => setLastAddedItem(null)

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + getEffectivePrice(item.product) * item.quantity,
        0,
      ),
    [items],
  )

  const deliveryFee = useMemo(
    () => calculateDeliveryFee(address, items.length > 0),
    [address, items.length],
  )
  const total = subtotal + deliveryFee

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    lastAddedItem,
    clearLastAddedItem,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
