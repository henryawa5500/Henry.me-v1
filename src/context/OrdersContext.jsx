/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { apiGet, apiPatch, apiPost, apiPut } from '../utils/api.js'

const OrdersContext = createContext(null)

export const useOrders = () => useContext(OrdersContext)

export const OrdersProvider = ({ children }) => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [latestNotification, setLatestNotification] = useState(null)

  const fetchOrders = async () => {
    if (!user) {
      setOrders([])
      return []
    }
    try {
      const response = await apiGet('/orders')
      const items = response?.data || []
      setOrders(items)
      return items
    } catch (error) {
      console.warn('Unable to load orders from backend.', error)
      setOrders([])
      return []
    }
  }

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([])
      return []
    }
    try {
      const response = await apiGet('/notifications')
      const items = response?.data || []
      setNotifications(items)
      return items
    } catch (error) {
      console.warn('Unable to load notifications from backend.', error)
      setNotifications([])
      return []
    }
  }

  useEffect(() => {
    if (!user) {
      setOrders([])
      setNotifications([])
      setLatestNotification(null)
      return
    }

    fetchOrders()
    fetchNotifications()
  }, [user])

  useEffect(() => {
    if (!notifications.length) {
      setLatestNotification(null)
      return
    }
    setLatestNotification(notifications[0])
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

  const refreshData = async () => {
    await Promise.all([fetchOrders(), fetchNotifications()])
  }

  const addOrder = async (order) => {
    const response = await apiPost('/orders', order)
    await refreshData()
    return response?.id || response?.order?.id || null
  }

  const updateOrderStatus = async (id, status) => {
    await apiPatch(`/orders/${id}/status`, { status })
    await refreshData()
  }

  const updateOrder = async (id, updates) => {
    await apiPut(`/orders/${id}`, updates)
    await fetchOrders()
  }

  const markPaymentVerified = async (id) => {
    await apiPost('/payments/verify', { orderId: id, status: 'Verified' })
    await refreshData()
  }

  const markPaymentFailed = async (id, reason = 'Payment could not be verified yet.') => {
    await apiPost('/payments/verify', {
      orderId: id,
      status: 'Verification Failed',
      failureReason: reason,
    })
    await refreshData()
  }

  const markPaymentPending = (id) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order
        return {
          ...order,
          status: order.status === 'Cancelled' ? order.status : 'Pending',
          payment: {
            ...(order.payment || {}),
            status: 'Pending Verification',
            failureReason: '',
            verifiedAt: '',
          },
        }
      }),
    )
  }

  const clearOrders = () => setOrders([])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
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
      refreshData,
    }),
    [orders, notifications, unseenCount, latestNotification],
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
