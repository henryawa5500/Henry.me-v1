import { Link, useLocation } from 'react-router-dom'
import { CartIcon, HomeIcon, ShopIcon, UserIcon } from '../ui/Icons.jsx'
import Badge from '../ui/Badge.jsx'
import { useCart } from '../../context/CartContext.jsx'

const BottomNav = () => {
  const { itemCount } = useCart()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const filter = searchParams.get('filter')

  const navItems = [
    { label: 'Home', to: '/home', icon: HomeIcon, active: location.pathname === '/home' && !filter },
    { label: 'Shop', to: '/home?filter=Best%20Sellers', icon: ShopIcon, active: location.pathname === '/home' && Boolean(filter) },
    { label: 'Cart', to: '/cart', icon: CartIcon, active: location.pathname === '/cart' },
    { label: 'Profile', to: '/login', icon: UserIcon, active: location.pathname === '/login' || location.pathname === '/signup' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`relative flex flex-col items-center gap-1 text-xs font-medium focus-ring ${
                item.active ? 'text-primary' : 'text-muted'
              }`}
            >
              <Icon size={20} />
              {item.label}
              {item.label === 'Cart' && itemCount > 0 && (
                <Badge className="absolute -right-2 -top-2">{itemCount}</Badge>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
