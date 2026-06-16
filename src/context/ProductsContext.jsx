/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockProducts } from '../data/mockProducts.js'
const API_BASE =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000')
import { getDiscountStatus, isDiscountActive } from '../utils/discounts.js'
import { apiDelete, apiGet, apiPost, apiPut } from '../utils/api.js'

const ProductsContext = createContext(null)

const normalizeProduct = (product) => {
  // Map imageUrl to image for consistent display
  let image = product.image || product.imageUrl
  // if image is a relative path (starts with '/'), prefix API base so browser requests go to backend
  if (typeof image === 'string' && image.startsWith('/')) {
    image = `${API_BASE}${image}`
  }
  const status = getDiscountStatus(product)
  const baseTags = Array.isArray(product.tags) ? product.tags : []
  const cleanedTags = baseTags.filter((tag) => tag !== 'Discounts')

  const normalized = { ...product, image, discountStatus: status }

  if (isDiscountActive(product)) {
    return { ...normalized, tags: [...cleanedTags, 'Discounts'] }
  }

  return { ...normalized, tags: cleanedTags }
}

export const useProducts = () => useContext(ProductsContext)

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState(mockProducts)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await apiGet('/products')
        if (!active) return
        setProducts(response?.data ?? mockProducts)
      } catch (error) {
        console.warn('Unable to load products from backend, using demo data.', error)
        if (!active) return
        setProducts(mockProducts)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const addProduct = async (product) => {
    const created = await apiPost('/products', product)
    setProducts((prev) => [created, ...prev])
    return created
  }

  const updateProduct = async (id, updates) => {
    const updated = await apiPut(`/products/${id}`, updates)
    setProducts((prev) => prev.map((product) => (product.id === id ? updated : product)))
    return updated
  }

  const updateMany = async (updater) => {
    const nextProducts = await Promise.all(
      products.map(async (product) => {
        const nextProduct = updater(product)
        if (nextProduct === product) return product
        const updated = await updateProduct(product.id, nextProduct)
        return updated
      }),
    )
    setProducts(nextProducts)
    return nextProducts
  }

  const removeProduct = async (id) => {
    await apiDelete(`/products/${id}`)
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
    isLoading,
    addProduct,
    updateProduct,
    updateMany,
    removeProduct,
    resetProducts,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
