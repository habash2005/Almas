import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!firstName.trim()) errs.firstName = 'First name is required'
    if (!lastName.trim()) errs.lastName = 'Last name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await register({ firstName, lastName, email, password })
      showToast('Account created successfully! Welcome to ALMAS.', 'success')
      navigate('/account')
    } catch (err) {
      showToast('Unable to create account. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (fieldName) =>
    `w-full px-4 py-3.5 bg-white border ${
      errors[fieldName] ? 'border-red-400' : 'border-stone-dark/50'
    } text-sm outline-none focus:border-black transition-colors placeholder:text-warm-gray/50`

  return (
    <section className="py-24 px-6 md:px-12 min-h-[70vh] flex items-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-3">Create Account</h1>
          <p className="text-warm-gray text-sm">Join the ALMAS experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className={inputClass('firstName')}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1.5">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className={inputClass('lastName')}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1.5">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={inputClass('email')}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={inputClass('password')}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className={inputClass('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 text-[11px] tracking-[0.15em] uppercase hover:bg-black/85 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-warm-gray">
          Already have an account?{' '}
          <Link to="/login" className="text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
