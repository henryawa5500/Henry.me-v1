import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from '../components/ui/Icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import heroShirts from '../assets/hero-shirts.jpg'

const Signup = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    password === confirmPassword

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isValid) return
    login({ name: `${firstName} ${lastName}`, email })
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
                <h1 className="text-3xl font-semibold">Create your account.</h1>
                <p className="mt-2 text-sm text-white/80">
                  Join HenryME for new drops, early access, and member-only offers.
                </p>
              </div>
              <div className="space-y-3 text-sm text-white/85">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-white" /> Save favorite tees
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-white" /> Track every order
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-white" /> Access exclusive drops
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
            <h1 className="text-2xl font-semibold">Sign up</h1>
            <p className="text-sm text-muted">
              Create an account to start ordering your favorite tees.
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Henry"
                required
              />
              <Input
                label="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Me"
                required
              />
            </div>
            <label className="block w-full text-sm font-medium text-primary">
              <span className="mb-2 block">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
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
            <label className="block w-full text-sm font-medium text-primary">
              <span className="mb-2 block">Confirm Password</span>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  className="h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-primary placeholder:text-muted transition focus-ring"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                >
                  {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </label>
            <Button full disabled={!isValid} type="submit">
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted">
            By creating an account, you agree to HenryME’s Terms and Privacy Policy.
          </p>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
