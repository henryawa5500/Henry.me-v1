import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  FacebookIcon,
  GoogleIcon,
} from '../components/ui/Icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import heroShirts from '../assets/hero-shirts.jpg'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const navigate = useNavigate()
  const { login } = useAuth()

  const isValid = email.trim() && password.trim()

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isValid) return
    login({ name: 'Henry', email })
    navigate('/home')
  }

  return (
    <div className="page-transition min-h-screen bg-white px-4 py-10 sm:bg-surface sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:flex">
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-border bg-cover bg-center p-8 text-white"
            style={{ backgroundImage: `url(${heroShirts})` }}
          >
            <div className="absolute inset-0 bg-black/55" />
            <div className="relative space-y-6">
              <img src="/henryme-logo.png" alt="HenryME" className="h-10 w-auto" />
              <div>
                <h1 className="text-3xl font-semibold">Welcome back.</h1>
                <p className="mt-2 text-sm text-white/80">
                  Sign in to manage orders, track deliveries, and access new drops.
                </p>
              </div>
              <div className="space-y-3 text-sm text-white/85">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-white" /> Secure checkout
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-white" /> Fast nationwide delivery
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-white" /> Exclusive member drops
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted"
          >
            <ArrowLeftIcon size={18} /> Back
          </button>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Log in</h1>
            <p className="text-sm text-muted">
              Enter your email and password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <label className="block w-full text-sm font-medium text-primary">
              <span className="mb-2 block">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-primary placeholder:text-muted transition focus-ring"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-xs text-muted">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-black focus:ring-black"
                />
                Remember me
              </label>
              <Link to="/login" className="font-medium">
                Forgot password?
              </Link>
            </div>

            <Button full disabled={!isValid} type="submit">
              Continue
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <Button full variant="outline" className="justify-center">
              <GoogleIcon /> Sign in with Google
            </Button>
            <Button full variant="outline" className="justify-center">
              <FacebookIcon /> Sign in with Facebook
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
