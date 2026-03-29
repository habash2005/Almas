import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email'
    if (!password.trim()) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await login(email, password)
      showToast('Welcome back!', 'success')
      navigate('/account')
    } catch (err) {
      showToast('Invalid email or password. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-24 px-6 md:px-12 min-h-[70vh] flex items-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-3">Sign In</h1>
          <p className="text-warm-gray text-sm">Welcome back to ALMAS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`w-full px-4 py-3.5 bg-white border ${
                errors.email ? 'border-red-400' : 'border-stone-dark/50'
              } text-sm outline-none focus:border-black transition-colors placeholder:text-warm-gray/50`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] tracking-[0.12em] uppercase text-warm-gray">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Please contact support@almasscent.com to reset your password.')}
                className="text-[11px] text-warm-gray hover:text-black transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full px-4 py-3.5 bg-white border ${
                errors.password ? 'border-red-400' : 'border-stone-dark/50'
              } text-sm outline-none focus:border-black transition-colors placeholder:text-warm-gray/50`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 text-[11px] tracking-[0.15em] uppercase hover:bg-black/85 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-warm-gray">
          Don't have an account?{' '}
          <Link to="/register" className="text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity">
            Create one
          </Link>
        </p>
      </div>
    </section>
  )
}
