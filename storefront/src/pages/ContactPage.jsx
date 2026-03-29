import { useState } from 'react'
import { Mail, MapPin, Phone, Clock, ArrowRight } from 'lucide-react'

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@almas-fragrance.com',
    href: 'mailto:hello@almas-fragrance.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (800) 555-ALMAS',
    href: 'tel:+18005552562',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: '123 Diamond Street, Suite 400\nNew York, NY 10001',
    href: null,
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Mon \u2013 Fri: 9am \u2013 6pm EST\nSat: 10am \u2013 4pm EST',
    href: null,
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <>
      {/* ===== HEADER ===== */}
      <section className="py-20 px-12 text-center bg-light-gray">
        <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-6 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-warm-gray" />
          Get in Touch
          <span className="w-8 h-px bg-warm-gray" />
        </p>
        <h1 className="font-serif text-[clamp(40px,5vw,64px)] font-light leading-[1.05] mb-4">Contact Us</h1>
        <p className="text-[15px] text-warm-gray max-w-[460px] mx-auto font-light leading-[1.7]">
          We'd love to hear from you. Whether you have a question about our fragrances, subscriptions, or anything else, our team is ready to help.
        </p>
      </section>

      {/* ===== SPLIT LAYOUT ===== */}
      <section className="grid grid-cols-2 min-h-[70vh]">
        {/* Left — Contact Form */}
        <div className="p-20">
          <h2 className="font-serif text-[clamp(24px,2.5vw,36px)] font-light mb-2">Send a Message</h2>
          <p className="text-sm text-warm-gray mb-10">Fill out the form below and we'll get back to you within 24 hours.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-2 font-sans">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-5 py-4 border border-black/[0.1] bg-transparent font-sans text-[13px] outline-none transition-colors duration-300 focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-2 font-sans">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-5 py-4 border border-black/[0.1] bg-transparent font-sans text-[13px] outline-none transition-colors duration-300 focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-2 font-sans">
                Subject
              </label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-black/[0.1] bg-transparent font-sans text-[13px] outline-none transition-colors duration-300 focus:border-black appearance-none cursor-pointer"
              >
                <option value="">Select a subject</option>
                <option value="order">Order Inquiry</option>
                <option value="product">Product Question</option>
                <option value="subscription">Subscription Help</option>
                <option value="return">Returns & Exchanges</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-2 font-sans">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                rows={6}
                className="w-full px-5 py-4 border border-black/[0.1] bg-transparent font-sans text-[13px] outline-none transition-colors duration-300 focus:border-black resize-vertical"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-white px-10 py-4 bg-black border-none cursor-pointer transition-all duration-400 hover:bg-[#333] group"
            >
              Send Message
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        {/* Right — Contact Info */}
        <div className="p-20 bg-light-gray flex flex-col justify-center">
          <h2 className="font-serif text-[clamp(24px,2.5vw,36px)] font-light mb-2">Contact Information</h2>
          <p className="text-sm text-warm-gray mb-12">Reach out to us through any of the channels below.</p>
          <div className="space-y-8">
            {contactInfo.map((info) => {
              const Icon = info.icon
              return (
                <div key={info.label} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full border border-black/[0.1] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-black" strokeWidth={1.2} />
                  </div>
                  <div>
                    <span className="block text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-1 font-sans">
                      {info.label}
                    </span>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-sm text-black no-underline hover:opacity-60 transition-opacity duration-300"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm text-black whitespace-pre-line m-0">{info.value}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Social links */}
          <div className="mt-14 pt-8 border-t border-black/[0.08]">
            <span className="block text-[11px] tracking-[0.15em] uppercase text-warm-gray mb-4 font-sans">
              Follow Us
            </span>
            <div className="flex gap-3">
              {['IG', 'TK', 'FB'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-[34px] h-[34px] border border-stone-dark rounded-full flex items-center justify-center no-underline text-black text-xs font-sans transition-all duration-300 hover:bg-black hover:text-white hover:border-black"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
