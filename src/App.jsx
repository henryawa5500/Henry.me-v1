import { Navigate, Route, Routes } from 'react-router-dom'
import ShopLayout from './components/layout/ShopLayout.jsx'
import Splash from './pages/Splash.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderComplete from './pages/OrderComplete.jsx'
import Admin from './pages/Admin.jsx'

const App = () => (
  <Routes>
    <Route path="/" element={<Splash />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    <Route element={<ShopLayout />}>
      <Route path="/home" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-complete" element={<OrderComplete />} />
    </Route>

    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
)

export default App
