import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { ArrowLeft, ArrowRight, Check, Lock, ShoppingBag } from 'lucide-react'

const STEPS = ['Contact', 'Shipping', 'Payment']

export default function CheckoutPage() {
  const { cart, getCartTotal, getCartCount, clearCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [orderPlaced, setOrderPlaced] = useState(false)

  // Contact
  const [email, setEmail] = useState('')
  const [createAccount, setCreateAccount] = useState(false)
  const [contactPassword, setContactPassword] = useState('')

  // Shipping
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [apt, setApt] = useState('')
  const [city, setCity] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [zip, setZip] = useState('')
  const [country, setCountry] = useState('United States')
  const [phone, setPhone] = useState('')

  // Payment
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [nameOnCard, setNameOnCard] = useState('')

  // Errors
  const [errors, setErrors] = useState({})

  const subtotal = getCartTotal()
  const shippingCost = subtotal >= 100 ? 0 : 8.95
  const total = subtotal + shippingCost

  const validateContact = () => {
    const errs = {}
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email'
    if (createAccount && contactPassword.length < 6) errs.contactPassword = 'Password must be at least 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateShipping = () => {
    const errs = {}
    if (!firstName.trim()) errs.firstName = 'First name is required'
    if (!lastName.trim()) errs.lastName = 'Last name is required'
    if (!address.trim()) errs.address = 'Address is required'
    if (!city.trim()) errs.city = 'City is required'
    if (!stateProvince.trim()) errs.stateProvince = 'State/Province is required'
    if (!zip.trim()) errs.zip = 'ZIP/Postal code is required'
    if (!country.trim()) errs.country = 'Country is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validatePayment = () => {
    const errs = {}
    if (!cardNumber.trim()) errs.cardNumber = 'Card number is required'
    else if (cardNumber.replace(/\s/g, '').length < 15) errs.cardNumber = 'Please enter a valid card number'
    if (!expiry.trim()) errs.expiry = 'Expiry date is required'
    else if (!/^\d{2}\/\d{2}$/.test(expiry)) errs.expiry = 'Use MM/YY format'
    if (!cvv.trim()) errs.cvv = 'CVV is required'
    else if (cvv.length < 3) errs.cvv = 'CVV must be 3-4 digits'
    if (!nameOnCard.trim()) errs.nameOnCard = 'Name on card is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    let valid = false
    if (currentStep === 0) valid = validateContact()
    else if (currentStep === 1) valid = validateShipping()
    else if (currentStep === 2) valid = validatePayment()

    if (valid) {
      if (currentStep === 2) {
        setOrderPlaced(true)
        clearCart()
        showToast('Order placed successfully!', 'success')
      } else {
        setCurrentStep(prev => prev + 1)
        setErrors({})
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setErrors({})
    }
  }

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  const inputClass = (fieldName) =>
    `w-full px-4 py-3.5 bg-white border ${
      errors[fieldName] ? 'border-red-400' : 'border-stone-dark/50'
    } text-sm outline-none focus:border-black transition-colors placeholder:text-warm-gray/50`

  // Order Success
  if (orderPlaced) {
    return (
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-black flex items-center justify-center">
            <Check className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">Thank You</h1>
          <p className="text-warm-gray text-sm leading-relaxed mb-3">
            Your order has been placed successfully.
          </p>
          <p className="text-warm-gray text-sm leading-relaxed mb-10">
            A confirmation email has been sent to <span className="text-black">{email}</span>.
          </p>
          <div className="bg-light-gray p-6 mb-10 text-left">
            <p className="text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-3">Order Details</p>
            <p className="text-sm mb-1">
              <span className="text-warm-gray">Order Number:</span>{' '}
              <span className="font-medium">ALM-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
            </p>
            <p className="text-sm mb-1">
              <span className="text-warm-gray">Shipping to:</span>{' '}
              {firstName} {lastName}, {city}, {stateProvince}
            </p>
            <p className="text-sm">
              <span className="text-warm-gray">Estimated delivery:</span> 5-7 business days
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 text-xs tracking-[0.15em] uppercase hover:bg-black/85 transition-all"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    )
  }

  // Empty cart redirect
  if (cart.length === 0 && !orderPlaced) {
    return (
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full border border-stone-dark flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-warm-gray" strokeWidth={1.2} />
          </div>
          <h1 className="font-serif text-4xl font-light mb-4">Your Bag is Empty</h1>
          <p className="text-warm-gray text-sm mb-10">Add items to your bag before checking out.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 text-xs tracking-[0.15em] uppercase hover:bg-black/85 transition-all"
          >
            Shop Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="font-serif text-2xl tracking-[0.08em] inline-block mb-8">
            ALMAS
          </Link>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-0 max-w-md mx-auto">
            {STEPS.map((step, idx) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  className={`flex items-center gap-2 ${idx <= currentStep ? 'cursor-pointer' : 'cursor-default'}`}
                  disabled={idx > currentStep}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      idx < currentStep
                        ? 'bg-black text-white'
                        : idx === currentStep
                        ? 'border-2 border-black text-black'
                        : 'border border-stone-dark text-warm-gray'
                    }`}
                  >
                    {idx < currentStep ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] tracking-[0.1em] uppercase hidden sm:inline ${
                      idx <= currentStep ? 'text-black' : 'text-warm-gray'
                    }`}
                  >
                    {step}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-px mx-2 sm:mx-4 ${
                      idx < currentStep ? 'bg-black' : 'bg-stone-dark'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-16">
          {/* Form Area */}
          <div className="lg:col-span-3">
            {/* Back Button */}
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-warm-gray hover:text-black transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {/* Step 1: Contact */}
            {currentStep === 0 && (
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-light mb-8">Contact Information</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                      Email Address *
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

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="create-account"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="w-4 h-4 accent-black"
                    />
                    <label htmlFor="create-account" className="text-sm text-warm-gray cursor-pointer">
                      Create an account for faster checkout next time
                    </label>
                  </div>

                  {createAccount && (
                    <div>
                      <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={contactPassword}
                        onChange={(e) => setContactPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className={inputClass('contactPassword')}
                      />
                      {errors.contactPassword && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.contactPassword}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Shipping */}
            {currentStep === 1 && (
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-light mb-8">Shipping Address</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                        First Name *
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
                        Last Name *
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
                      Address *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address"
                      className={inputClass('address')}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1.5">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                      Apartment, suite, etc.
                    </label>
                    <input
                      type="text"
                      value={apt}
                      onChange={(e) => setApt(e.target.value)}
                      placeholder="Apt, suite, unit (optional)"
                      className={inputClass('apt')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className={inputClass('city')}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        placeholder="State"
                        className={inputClass('stateProvince')}
                      />
                      {errors.stateProvince && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.stateProvince}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                        ZIP / Postal Code *
                      </label>
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="ZIP code"
                        className={inputClass('zip')}
                      />
                      {errors.zip && <p className="text-red-500 text-xs mt-1.5">{errors.zip}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                        Country *
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={inputClass('country')}
                      >
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Australia</option>
                        <option>Germany</option>
                        <option>France</option>
                        <option>United Arab Emirates</option>
                        <option>Saudi Arabia</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="For delivery updates"
                      className={inputClass('phone')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 2 && (
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-light mb-8">Payment</h2>
                <div className="flex items-center gap-2 text-xs text-warm-gray mb-6">
                  <Lock className="w-3.5 h-3.5" />
                  All transactions are secure and encrypted
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={inputClass('cardNumber')}
                    />
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1.5">{errors.cardNumber}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={inputClass('expiry')}
                      />
                      {errors.expiry && <p className="text-red-500 text-xs mt-1.5">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className={inputClass('cvv')}
                      />
                      {errors.cvv && <p className="text-red-500 text-xs mt-1.5">{errors.cvv}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      placeholder="As it appears on your card"
                      className={inputClass('nameOnCard')}
                    />
                    {errors.nameOnCard && <p className="text-red-500 text-xs mt-1.5">{errors.nameOnCard}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 flex items-center justify-between">
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-warm-gray hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <Link
                  to="/cart"
                  className="flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-warm-gray hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Bag
                </Link>
              )}

              <button
                onClick={handleNext}
                className="bg-black text-white px-10 py-4 text-[11px] tracking-[0.15em] uppercase hover:bg-black/85 transition-all flex items-center gap-3"
              >
                {currentStep === 2 ? 'Place Order' : 'Continue'}
                {currentStep === 2 ? <Lock className="w-3.5 h-3.5" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2 mt-12 lg:mt-0">
            <div className="bg-light-gray p-8 lg:sticky lg:top-32">
              <h3 className="text-[11px] tracking-[0.15em] uppercase font-medium mb-6">
                Order Summary ({getCartCount()})
              </h3>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto scrollbar-hide">
                {cart.map((item) => {
                  const price = item.product.prices?.[item.size] || 0
                  const linePrice = item.isSubscription ? price * 0.85 : price

                  return (
                    <div
                      key={`${item.product.id}-${item.size}-${item.isSubscription}`}
                      className="flex gap-4"
                    >
                      <div className="w-16 h-20 bg-stone/50 flex items-center justify-center shrink-0 relative">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-serif text-stone-dark text-[10px]">ALMAS</span>
                        )}
                        {item.quantity > 1 && (
                          <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[9px] rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="font-serif text-sm">{item.product.name}</p>
                        <p className="text-[11px] text-warm-gray">{item.size}</p>
                        {item.isSubscription && (
                          <p className="text-[10px] text-warm-gray mt-0.5">Subscribe & Save</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm">${(linePrice * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-stone-dark/30 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-dark/30">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-serif text-xl">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
