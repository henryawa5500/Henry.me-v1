/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const OrdersContext = createContext(null)
const STORAGE_KEY = 'henryme-orders'
const NOTIFICATIONS_KEY = 'henryme-notifications'

const loadOrders = () => {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const loadNotifications = () => {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(NOTIFICATIONS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => item && item.type && item.orderId)
  } catch {
    return []
  }
}

export const useOrders = () => useContext(OrdersContext)

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(loadOrders)
  const [notifications, setNotifications] = useState(loadNotifications)
  const [latestNotification, setLatestNotification] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  }, [notifications])

  const addNotification = (notification) => {
    setNotifications((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1
      const nextNotification = {
        ...notification,
        id: notification.id ?? nextId,
        createdAt: notification.createdAt ?? new Date().toISOString(),
        read: notification.read ?? false,
      }
      setLatestNotification(nextNotification)
      return [nextNotification, ...prev]
    })
  }

  const addOrder = (order) => {
    const nextId = orders.length ? Math.max(...orders.map((item) => item.id)) + 1 : 1
    const nextOrder = {
      ...order,
      id: order.id ?? nextId,
      createdAt: order.createdAt ?? new Date().toISOString(),
      status: order.status ?? 'Pending',
    }

    setOrders((prev) => [...prev, nextOrder])

    addNotification({
      type: 'order_new',
      orderId: nextOrder.id,
    })

    return nextOrder.id
  }

  const updateOrderStatus = (id, status) => {
    let updatedOrder = null
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order
        if (order.status === status) return order
        const nextOrder = { ...order, status }
        if (status === 'Paid') {
          nextOrder.payment = {
            ...(order.payment || {}),
            status: 'Verified',
            verifiedAt: new Date().toISOString(),
            failureReason: '',
          }
        }
        updatedOrder = nextOrder
        return updatedOrder
      }),
    )

    if (!updatedOrder) return

    if (status === 'Paid') {
      addNotification({
        type: 'payment_verified',
        orderId: updatedOrder.id,
      })
    }

    if (status === 'Fulfilled') {
      addNotification({
        type: 'order_fulfilled',
        orderId: updatedOrder.id,
      })
    }

    if (status === 'Cancelled') {
      addNotification({
        type: 'order_cancelled',
        orderId: updatedOrder.id,
      })
    }
  }

  const updateOrder = (id, updates) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, ...updates } : order)),
    )
  }

  const markPaymentVerified = (id) => {
    let didUpdate = false
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order
        if (order.payment?.status === 'Verified' && order.status === 'Paid') {
          return order
        }
        didUpdate = true
        const nextPayment = {
          ...(order.payment || {}),
          status: 'Verified',
          verifiedAt: new Date().toISOString(),
          failureReason: '',
        }
        return { ...order, status: 'Paid', payment: nextPayment }
      }),
    )
    if (didUpdate) {
      addNotification({
        type: 'payment_verified',
        orderId: id,
      })
    }
  }

  const markPaymentFailed = (id, reason = 'Payment could not be verified yet.') => {
    let didUpdate = false
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order
        if (order.status === 'Cancelled') return order
        if (
          order.payment?.status === 'Verification Failed' &&
          (order.payment?.failureReason || '') === reason
        ) {
          return order
        }
        didUpdate = true
        const nextPayment = {
          ...(order.payment || {}),
          status: 'Verification Failed',
          failureReason: reason,
          verifiedAt: '',
        }
        return {
          ...order,
          status: order.status === 'Paid' ? 'Pending' : order.status,
          payment: nextPayment,
        }
      }),
    )

    if (didUpdate) {
      addNotification({
        type: 'payment_failed',
        orderId: id,
      })
    }
  }

  const markPaymentPending = (id) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order
        const nextPayment = {
          ...(order.payment || {}),
          status: 'Pending Verification',
          failureReason: '',
          verifiedAt: '',
        }
        return {
          ...order,
          status: order.status === 'Cancelled' ? order.status : 'Pending',
          payment: nextPayment,
        }
      }),
    )
  }

  const clearOrders = () => setOrders([])

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    )
  }

  const unseenCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  const dismissLatestNotification = () => {
    setLatestNotification(null)
  }

  const value = useMemo(
    () => ({
      orders,
      addOrder,
      updateOrderStatus,
      updateOrder,
      markPaymentVerified,
      markPaymentFailed,
      markPaymentPending,
      clearOrders,
      notifications,
      unseenCount,
      markAllRead,
      latestNotification,
      dismissLatestNotification,
    }),
    [orders, notifications, unseenCount, latestNotification],
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
