import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { User, Package, RefreshCw, LogOut, ChevronRight, SkipForward, ArrowRightLeft, XCircle } from 'lucide-react'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
]

const SAMPLE_ORDERS = [
  {
    id: 'ALM-8F3K2P',
    date: 'March 15, 2026',
    status: 'Delivered',
    total: 245.00,
    items: [
      { name: 'Midnight Aventus', size: '100ml', qty: 1 },
      { name: 'Velvet Orchid', size: '50ml', qty: 1 },
    ],
  },
  {
    id: 'ALM-7H9N1M',
    date: 'February 28, 2026',
    status: 'Shipped',
    total: 180.00,
    items: [
      { name: 'Royal Oud', size: '100ml', qty: 1 },
    ],
  },
]

const SAMPLE_SUBSCRIPTIONS = [
  {
    id: 'SUB-001',
    product: 'Midnight Aventus',
    size: '100ml',
    price: 153.00,
    frequency: 'Every 3 months',
    nextDelivery: 'April 15, 2026',
    status: 'Active',
  },
  {
    id: 'SUB-002',
    product: 'Rose Elixir',
    size: '50ml',
    price: 102.00,
    frequency: 'Every 3 months',
    nextDelivery: 'May 1, 2026',
    status: 'Active',
  },
]

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile form
  const [profileFirstName, setProfileFirstName] = useState(user?.firstName || 'Jane')
  const [profileLastName, setProfileLastName] = useState(user?.lastName || 'Doe')
  const [profileEmail, setProfileEmail] = useState(user?.email || 'jane@example.com')
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setProfileSaved(true)
    showToast('Profile updated successfully.', 'success')
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const handleLogout = () => {
    logout()
    showToast('You have been signed out.', 'info')
    navigate('/')
  }

  if (!isAuthenticated) return null

  const statusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-700'
      case 'Shipped': return 'bg-blue-50 text-blue-700'
      case 'Processing': return 'bg-yellow-50 text-yellow-700'
      case 'Active': return 'bg-green-50 text-green-700'
      case 'Paused': return 'bg-yellow-50 text-yellow-700'
      default: return 'bg-light-gray text-warm-gray'
    }
  }

  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">My Account</h1>
            <p className="text-warm-gray text-sm">
              Welcome back, {profileFirstName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-warm-gray hover:text-black transition-colors self-start md:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-hide">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-all whitespace-nowrap w-full text-left ${
                    activeTab === id
                      ? 'bg-light-gray text-black'
                      : 'text-warm-gray hover:text-black hover:bg-light-gray/50'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {label}
                  {activeTab === id && (
                    <ChevronRight className="w-3 h-3 ml-auto hidden lg:block" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="font-serif text-2xl font-light mb-8">Profile Details</h2>
                <form onSubmit={handleSaveProfile} className="max-w-lg space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileFirstName}
                        onChange={(e) => setProfileFirstName(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border border-stone-dark/50 text-sm outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileLastName}
                        onChange={(e) => setProfileLastName(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white border border-stone-dark/50 text-sm outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.12em] uppercase text-warm-gray mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-stone-dark/50 text-sm outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-black text-white px-8 py-3.5 text-[11px] tracking-[0.15em] uppercase hover:bg-black/85 transition-all"
                    >
                      {profileSaved ? 'Saved' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-serif text-2xl font-light mb-8">Order History</h2>
                {SAMPLE_ORDERS.length > 0 ? (
                  <div className="space-y-4">
                    {SAMPLE_ORDERS.map((order) => (
                      <div
                        key={order.id}
                        className="border border-stone-dark/30 p-6 hover:border-stone-dark/60 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">{order.id}</span>
                            <span className={`text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 ${statusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <span className="text-xs text-warm-gray">{order.date}</span>
                        </div>
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-sm text-warm-gray">
                              {item.name} &mdash; {item.size} &times; {item.qty}
                            </p>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-stone-dark/20">
                          <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                          <button className="text-[11px] tracking-[0.1em] uppercase text-warm-gray hover:text-black transition-colors border-b border-warm-gray hover:border-black pb-0.5">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-light-gray">
                    <Package className="w-10 h-10 text-warm-gray mx-auto mb-4" strokeWidth={1.2} />
                    <p className="font-serif text-xl mb-2">No Orders Yet</p>
                    <p className="text-sm text-warm-gray mb-6">Your order history will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div>
                <h2 className="font-serif text-2xl font-light mb-8">My Subscriptions</h2>
                {SAMPLE_SUBSCRIPTIONS.length > 0 ? (
                  <div className="space-y-4">
                    {SAMPLE_SUBSCRIPTIONS.map((sub) => (
                      <div
                        key={sub.id}
                        className="border border-stone-dark/30 p-6 hover:border-stone-dark/60 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-serif text-lg">{sub.product}</h3>
                              <span className={`text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 ${statusColor(sub.status)}`}>
                                {sub.status}
                              </span>
                            </div>
                            <p className="text-xs text-warm-gray">{sub.size} &middot; {sub.frequency}</p>
                          </div>
                          <span className="font-serif text-lg">${sub.price.toFixed(2)}</span>
                        </div>

                        <div className="bg-light-gray px-4 py-3 mb-5">
                          <p className="text-xs text-warm-gray">
                            Next delivery: <span className="text-black">{sub.nextDelivery}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 border border-stone-dark/50 text-[10px] tracking-[0.1em] uppercase hover:border-black transition-colors">
                            <SkipForward className="w-3 h-3" />
                            Skip Next
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 border border-stone-dark/50 text-[10px] tracking-[0.1em] uppercase hover:border-black transition-colors">
                            <ArrowRightLeft className="w-3 h-3" />
                            Swap Scent
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-[10px] tracking-[0.1em] uppercase text-red-500 hover:border-red-400 transition-colors">
                            <XCircle className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-light-gray">
                    <RefreshCw className="w-10 h-10 text-warm-gray mx-auto mb-4" strokeWidth={1.2} />
                    <p className="font-serif text-xl mb-2">No Active Subscriptions</p>
                    <p className="text-sm text-warm-gray mb-6">
                      Subscribe & save 15% on your favorite fragrances.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
