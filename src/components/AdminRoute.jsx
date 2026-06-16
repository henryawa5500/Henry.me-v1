import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const AdminRoute = ({ children }) => {
  const { user, isLoggedIn, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/home" replace />
  }

  return children
}

export default AdminRoute
