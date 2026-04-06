import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useProducts } from '../context/ProductsContext.jsx'
import { useOrders } from '../context/OrdersContext.jsx'
import { formatCurrency } from '../utils/formatCurrency.js'
import { getDiscountStatus, getDiscountedPrice, isDiscountActive } from '../utils/discounts.js'

const tagOptions = ['New Arrivals', 'Best Sellers']

const Admin = () => {
  const { products, addProduct, updateProduct, removeProduct, resetProducts } =
    useProducts()
  const { orders, updateOrderStatus } = useOrders()
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    tags: [],
    discountEnabled: false,
    discountPercent: '',
    discountStart: '',
    discountEnd: '',
  })
  const [imagePreview, setImagePreview] = useState('')
  const [imageName, setImageName] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [discountForm, setDiscountForm] = useState({
    enabled: false,
    percent: '',
    start: '',
    end: '',
  })

  useEffect(() => {
    if (!selectedId && products.length) {
      setSelectedId(String(products[0].id))
    }
  }, [products, selectedId])

  const hasProducts = products.length > 0

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === String(selectedId)),
    [products, selectedId],
  )

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === 'Pending'),
    [orders],
  )

  const formatOrderDate = (value) => {
    if (!value) return '—'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '—'
    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getOrderItemsCount = (order) =>
    Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      : 0

  useEffect(() => {
    if (!selectedProduct) return
    setDiscountForm({
      enabled: Boolean(selectedProduct.discount?.enabled),
      percent: selectedProduct.discount?.percent ?? '',
      start: selectedProduct.discount?.start ?? '',
      end: selectedProduct.discount?.end ?? '',
    })
  }, [selectedProduct])

  const handleInputChange = (key) => (event) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter((item) => item !== tag)
        : [...prev.tags, tag]
      return { ...prev, tags }
    })
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      tags: [],
      discountEnabled: false,
      discountPercent: '',
      discountStart: '',
      discountEnd: '',
    })
    setImagePreview('')
    setImageName('')
  }

  const handleAddProduct = (event) => {
    event.preventDefault()
    const trimmedName = formData.name.trim()
    const priceValue = Number(formData.price)
    if (!trimmedName || Number.isNaN(priceValue) || priceValue <= 0) return

    const discountEnabled = Boolean(formData.discountEnabled)
    const discountPercent = Number(formData.discountPercent || 10)
    const nextProduct = {
      name: trimmedName,
      price: priceValue,
      tags: formData.tags,
      image: imagePreview || '',
      discount: discountEnabled
        ? {
            enabled: true,
            percent: Number.isNaN(discountPercent) ? 10 : discountPercent,
            start: formData.discountStart,
            end: formData.discountEnd,
          }
        : { enabled: false },
    }

    addProduct(nextProduct)
    resetForm()
  }

  const handleDiscountApply = () => {
    if (!selectedProduct) return
    const percent = Number(discountForm.percent || 10)
    updateProduct(selectedProduct.id, {
      discount: discountForm.enabled
        ? {
            enabled: true,
            percent: Number.isNaN(percent) ? 10 : percent,
            start: discountForm.start,
            end: discountForm.end,
          }
        : { enabled: false },
    })
  }

  const handleDiscountClear = () => {
    if (!selectedProduct) return
    updateProduct(selectedProduct.id, {
      discount: { enabled: false },
    })
  }

  const isAddDisabled =
    !formData.name.trim() ||
    !formData.price ||
    Number.isNaN(Number(formData.price)) ||
    Number(formData.price) <= 0

  return (
    <div className="page-transition space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Admin</p>
          <h1 className="mt-2 text-2xl font-semibold">Product Manager</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Add new drops, upload images, and schedule discounts. Items are stored
            in your browser&apos;s local storage for now.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetProducts}>
          Reset Demo Data
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={handleAddProduct}
          className="rounded-2xl border border-border bg-white p-6"
        >
          <h2 className="text-lg font-semibold">Add New Product</h2>
          <div className="mt-4 space-y-4">
            <Input
              label="Product name"
              placeholder="e.g. Limited Drop Tee"
              value={formData.name}
              onChange={handleInputChange('name')}
            />
            <Input
              label="Price (₦)"
              type="number"
              min="0"
              step="100"
              placeholder="15000"
              value={formData.price}
              onChange={handleInputChange('price')}
            />

            <div>
              <p className="text-sm font-medium text-primary">Tags</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {tagOptions.map((tag) => (
                  <label
                    key={tag}
                    className="inline-flex items-center gap-2 text-sm text-muted"
                  >
                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="h-4 w-4 rounded border-border text-primary focus-ring"
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-primary">Product image</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-[#F6F6F6]">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-muted">Preview</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-ring"
                  />
                  {imageName ? (
                    <p className="mt-2 text-xs text-muted">{imageName}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">Discount</p>
                  <p className="text-xs text-muted">
                    Schedule a discount for this new item.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={formData.discountEnabled}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountEnabled: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-border text-primary focus-ring"
                  />
                  Enable
                </label>
              </div>

              {formData.discountEnabled && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Input
                    label="Percent"
                    type="number"
                    min="1"
                    max="90"
                    placeholder="10"
                    value={formData.discountPercent}
                    onChange={handleInputChange('discountPercent')}
                  />
                  <Input
                    label="Start date"
                    type="date"
                    value={formData.discountStart}
                    onChange={handleInputChange('discountStart')}
                  />
                  <Input
                    label="End date"
                    type="date"
                    value={formData.discountEnd}
                    onChange={handleInputChange('discountEnd')}
                  />
                </div>
              )}
            </div>
          </div>

          <Button full className="mt-6" disabled={isAddDisabled} type="submit">
            Add Product
          </Button>
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Pending Orders</h2>
                <p className="mt-1 text-xs text-muted">
                  Orders waiting to be fulfilled.
                </p>
              </div>
              <Badge className="bg-black text-white">
                {pendingOrders.length}
              </Badge>
            </div>

            <div className="mt-4 space-y-4">
              {pendingOrders.length === 0 ? (
                <p className="text-sm text-muted">No pending orders yet.</p>
              ) : (
                pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          Order #{String(order.id).padStart(3, '0')}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted">
                        <p>{getOrderItemsCount(order)} items</p>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {formatCurrency(order.total ?? order.summary?.total ?? 0)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                      {order.items?.slice(0, 3).map((item) => (
                        <span
                          key={`${order.id}-${item.productId ?? item.id ?? item.name}`}
                          className="rounded-full border border-border px-2 py-1"
                        >
                          {item.name}
                        </span>
                      ))}
                      {order.items?.length > 3 ? (
                        <span className="rounded-full border border-border px-2 py-1">
                          +{order.items.length - 3} more
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'Fulfilled')}
                      >
                        Mark Fulfilled
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold">Manage Discounts</h2>
            <p className="mt-2 text-xs text-muted">
              Select a product and update its discount window.
            </p>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-primary">
                Product
                <select
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                  disabled={!hasProducts}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm focus-ring"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={discountForm.enabled}
                  onChange={(event) =>
                    setDiscountForm((prev) => ({
                      ...prev,
                      enabled: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-border text-primary focus-ring"
                />
                Enable discount
              </label>

              {discountForm.enabled && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    label="Percent"
                    type="number"
                    min="1"
                    max="90"
                    placeholder="10"
                    value={discountForm.percent}
                    onChange={(event) =>
                      setDiscountForm((prev) => ({
                        ...prev,
                        percent: event.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Start date"
                    type="date"
                    value={discountForm.start}
                    onChange={(event) =>
                      setDiscountForm((prev) => ({
                        ...prev,
                        start: event.target.value,
                      }))
                    }
                  />
                  <Input
                    label="End date"
                    type="date"
                    value={discountForm.end}
                    onChange={(event) =>
                      setDiscountForm((prev) => ({
                        ...prev,
                        end: event.target.value,
                      }))
                    }
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDiscountApply} disabled={!hasProducts}>
                  Apply Discount
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDiscountClear}
                  disabled={!hasProducts}
                >
                  Clear Discount
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold">Current Products</h2>
            <div className="mt-4 space-y-4">
              {!hasProducts ? (
                <p className="text-sm text-muted">No products yet.</p>
              ) : (
                products.map((product) => {
                  const status = product.discountStatus || getDiscountStatus(product)
                  const discountedPrice = getDiscountedPrice(product)
                  const hasDiscount =
                    isDiscountActive(product) && discountedPrice !== null
                  return (
                    <div
                      key={product.id}
                      className="flex flex-wrap items-center gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-border bg-[#F6F6F6]">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-muted">Image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{product.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span className="font-semibold text-primary">
                            {formatCurrency(
                              hasDiscount ? discountedPrice : product.price,
                            )}
                          </span>
                          {hasDiscount ? (
                            <span className="line-through">
                              {formatCurrency(product.price)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <Badge
                        className={
                          status === 'Active' || status === 'Enabled'
                            ? 'bg-black text-white'
                            : 'border border-border bg-white text-muted'
                        }
                      >
                        {status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
