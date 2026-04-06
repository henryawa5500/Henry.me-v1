import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BellIcon, CartIcon, SearchIcon } from '../ui/Icons.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import NotificationsPanel from '../ui/NotificationsPanel.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useOrders } from '../../context/OrdersContext.jsx'

const MobileTopBar = () => {
  const { itemCount } = useCart()
  const { isLoggedIn, logout } = useAuth()
  const { notifications, unseenCount, markAllRead, orders } = useOrders()
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSearchClick = () => {
    if (location.pathname !== '/home') {
      navigate('/home', { state: { focusSearch: true } })
      return
    }
    window.dispatchEvent(new Event('henryme:focusSearch'))
  }

  const handleNotificationsClose = () => {
    setShowNotifications(false)
    if (unseenCount > 0) {
      markAllRead()
    }
  }

  const handleNotificationsToggle = () => {
    setShowNotifications((prev) => {
      if (prev && unseenCount > 0) {
        markAllRead()
      }
      return !prev
    })
  }

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-white px-4 py-3 lg:hidden">
      <Link to="/home" className="flex items-center">
        <img src="/henryme-logo.png" alt="HenryME" className="h-9 w-auto" />
      </Link>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Search"
          onClick={handleSearchClick}
          className="rounded-lg border border-border p-2 focus-ring"
        >
          <SearchIcon size={16} />
        </button>
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            aria-controls="mobile-notifications"
            onClick={handleNotificationsToggle}
            className="relative rounded-lg border border-border p-2 focus-ring"
          >
            <BellIcon size={16} />
            {unseenCount > 0 && (
              <Badge className="absolute -right-2 -top-2">{unseenCount}</Badge>
            )}
          </button>
          <NotificationsPanel
            open={showNotifications}
            onClose={handleNotificationsClose}
            panelId="mobile-notifications"
            className="right-0 top-12 w-64"
            notifications={notifications}
            orders={orders}
          />
        </div>
        <Link
          to="/cart"
          aria-label="Cart"
          className="relative rounded-lg border border-border p-2 focus-ring"
        >
          <CartIcon size={16} />
          {itemCount > 0 && (
            <Badge className="absolute -right-2 -top-2">{itemCount}</Badge>
          )}
        </Link>
        {isLoggedIn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  )
}

export default MobileTopBar
