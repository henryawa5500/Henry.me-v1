/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import { getEffectivePrice } from '../utils/discounts.js'

const CartContext = createContext(null)

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])

  const addItem = (product, options = {}) => {
    const size = options.size || 'M'
    const quantityToAdd = options.quantity || 1
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size,
      )
      if (existingIndex >= 0) {
        return prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item,
        )
      }
      return [...prev, { product, size, quantity: quantityToAdd }]
    })
  }

  const removeItem = (id, size = 'M') => {
    setItems((prev) =>
      prev.filter((item) => !(item.product.id === id && item.size === size)),
    )
  }

  const updateQuantity = (id, quantity, size = 'M') => {
    if (quantity <= 0) {
      removeItem(id, size)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === id && item.size === size
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  const clearCart = () => setItems([])

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

  const deliveryFee = items.length ? 700 : 0
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
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
