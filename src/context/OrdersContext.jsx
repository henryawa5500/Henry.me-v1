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
    return Array.isArray(parsed) ? parsed : []
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
    setOrders((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1
      const nextOrder = {
        ...order,
        id: order.id ?? nextId,
        createdAt: order.createdAt ?? new Date().toISOString(),
        status: order.status ?? 'Pending',
      }

      addNotification({
        type: 'order_new',
        orderId: nextOrder.id,
      })

      return [
        ...prev,
        nextOrder,
      ]
    })
  }

  const updateOrderStatus = (id, status) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order
        if (order.status === status) return order
        const updated = { ...order, status }

        if (status === 'Fulfilled') {
          addNotification({
            type: 'order_fulfilled',
            orderId: updated.id,
          })
        }

        if (status === 'Cancelled') {
          addNotification({
            type: 'order_cancelled',
            orderId: updated.id,
          })
        }

        return updated
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
