import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Splash = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding'), 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="page-transition flex min-h-screen items-center justify-center bg-black text-white">
      <img src="/henryme-logo.png" alt="HenryME" className="h-14 w-auto" />
    </div>
  )
}

export default Splash

