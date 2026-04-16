import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'
import { OrdersProvider } from './context/OrdersContext.jsx'
import { AddressProvider } from './context/AddressContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductsProvider>
          <OrdersProvider>
            <AddressProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </AddressProvider>
          </OrdersProvider>
        </ProductsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

