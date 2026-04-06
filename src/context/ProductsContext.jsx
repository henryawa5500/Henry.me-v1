/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockProducts } from '../data/mockProducts.js'
import { getDiscountStatus, isDiscountActive } from '../utils/discounts.js'

const STORAGE_KEY = 'henryme-products'
const ProductsContext = createContext(null)

const loadProducts = () => {
  if (typeof window === 'undefined') return mockProducts
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return mockProducts
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : mockProducts
  } catch {
    return mockProducts
  }
}

const normalizeProduct = (product) => {
  const status = getDiscountStatus(product)
  const baseTags = Array.isArray(product.tags) ? product.tags : []
  const cleanedTags = baseTags.filter((tag) => tag !== 'Discounts')

  if (isDiscountActive(product)) {
    return { ...product, tags: [...cleanedTags, 'Discounts'], discountStatus: status }
  }

  return { ...product, tags: cleanedTags, discountStatus: status }
}

export const useProducts = () => useContext(ProductsContext)

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState(loadProducts)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }, [products])

  const addProduct = (product) => {
    setProducts((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1
      return [...prev, { ...product, id: product.id ?? nextId }]
    })
  }

  const updateProduct = (id, updates) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...updates } : product)),
    )
  }

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const resetProducts = () => {
    setProducts(mockProducts)
  }

  const decoratedProducts = useMemo(
    () => products.map((product) => normalizeProduct(product)),
    [products],
  )

  const value = {
    products: decoratedProducts,
    rawProducts: products,
    addProduct,
    updateProduct,
    removeProduct,
    resetProducts,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
