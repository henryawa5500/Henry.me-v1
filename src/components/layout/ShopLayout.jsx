import { Outlet } from 'react-router-dom'
import TopNav from './TopNav.jsx'
import BottomNav from './BottomNav.jsx'
import MobileTopBar from './MobileTopBar.jsx'
import NotificationsToast from '../ui/NotificationsToast.jsx'

const ShopLayout = () => (
  <div className="min-h-screen bg-white text-primary">
    <MobileTopBar />
    <TopNav />
    <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
      <Outlet />
    </main>
    <BottomNav />
    <NotificationsToast />
  </div>
)

export default ShopLayout

