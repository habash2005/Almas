import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Gift, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

const steps = [
  {
    number: '01',
    title: 'Choose Your Fragrance',
    description: 'Browse our collection and select your signature scent from over 140 luxury-inspired fragrances.',
    icon: '\u25C6',
  },
  {
    number: '02',
    title: 'Subscribe & Save',
    description: 'Select the Subscribe & Save option at checkout and save 15% on every delivery, plus free shipping.',
    icon: '\u27F3',
  },
  {
    number: '03',
    title: 'Receive Every 3 Months',
    description: 'Sit back and enjoy. Your fresh bottle arrives every 3 months. Skip, swap, or cancel anytime.',
    icon: '\u2713',
  },
]

const benefits = [
  'Save 15% on every delivery',
  'Free shipping on all subscription orders',
  'Skip, swap, or cancel anytime — no commitments',
  'Exclusive early access to new releases',
  'Priority customer support',
  'Special subscriber-only offers and gifts',
]

const faqs = [
  {
    question: 'How does the subscription work?',
    answer:
      'Choose your favorite ALMAS fragrance and select the Subscribe & Save option. You\'ll receive a fresh bottle every 3 months at 15% off the regular price, with free shipping on every order.',
  },
  {
    question: 'Can I skip a delivery or cancel?',
    answer:
      'Absolutely. You can skip, pause, or cancel your subscription at any time from your account dashboard. There are no commitments or cancellation fees.',
  },
  {
    question: 'Can I change my fragrance?',
    answer:
      'Yes! You can swap your fragrance before each delivery. Simply log into your account and select a different scent from our collection before your next shipment date.',
  },
  {
    question: 'When will I be charged?',
    answer:
      'You\'ll be charged when you first subscribe, then every 3 months on the same date. You\'ll receive an email reminder 5 days before each charge.',
  },
  {
    question: 'Is there a minimum commitment?',
    answer:
      'No minimum commitment whatsoever. You can cancel after your very first delivery if you choose. We believe in the quality of our fragrances and want you to stay because you love them.',
  },
  {
    question: 'Can I gift a subscription?',
    answer:
      'Yes! Our gift subscriptions make a perfect present. Choose a fragrance, select the gift option, and we\'ll deliver it beautifully wrapped with a personalized message.',
  },
]

export default function SubscriptionPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const subscribableProducts = products.slice(0, 8)

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="min-h-[60vh] flex items-center justify-center text-center bg-black text-white px-6 md:px-12 py-32 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full border border-white/[0.04]" />
        <div className="absolute bottom-[10%] right-[15%] w-[200px] h-[200px] rounded-full border border-white/[0.03]" />
        <div className="relative z-[2] max-w-[600px]">
          <span className="text-[9px] tracking-[0.15em] uppercase border border-white/20 inline-block px-3.5 py-1.5 mb-8">
            Subscribe & Save 15%
          </span>
          <h1 className="font-serif text-[clamp(44px,5.5vw,72px)] font-light leading-[1.05] mb-6">
            ALMAS Refill Club
          </h1>
          <p className="text-[15px] leading-[1.7] text-white/50 max-w-[460px] mx-auto mb-10 font-light">
            Never run out of your signature scent. Subscribe to automatic deliveries every 3 months and enjoy exclusive savings.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline px-10 py-4 bg-white transition-all duration-400 hover:bg-stone group"
          >
            Browse Fragrances
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 md:py-[100px] px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="font-serif text-[clamp(32px,3.5vw,52px)] font-light leading-[1.1] mb-3">How It Works</h2>
          <p className="text-sm text-warm-gray max-w-[400px] mx-auto">
            Three simple steps to your perfect fragrance subscription
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-[960px] mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-20 h-20 rounded-full border border-black/[0.1] mx-auto mb-6 flex items-center justify-center text-3xl text-warm-gray">
                {step.icon}
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-warm-gray block mb-3">
                Step {step.number}
              </span>
              <h3 className="font-serif text-xl font-normal mb-3">{step.title}</h3>
              <p className="text-[13px] text-warm-gray leading-[1.7] max-w-[280px] mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="py-16 md:py-[100px] px-6 md:px-12 bg-light-gray">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-[960px] mx-auto items-center">
          <div>
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-7 flex items-center gap-3">
              <span className="w-8 h-px bg-warm-gray" />
              Member Benefits
            </p>
            <h2 className="font-serif text-[clamp(28px,3vw,44px)] font-light leading-[1.15] mb-5">
              Why Subscribe with ALMAS?
            </h2>
            <p className="text-[15px] leading-[1.8] text-warm-gray max-w-[400px] font-light">
              Our subscription program is designed to make your fragrance experience effortless, affordable, and rewarding.
            </p>
          </div>
          <div>
            <ul className="list-none">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="text-[13px] text-black py-3.5 border-b border-black/[0.06] flex items-center gap-3"
                >
                  <span className="w-[18px] h-[18px] rounded-full bg-black text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== SUBSCRIBABLE PRODUCTS ===== */}
      <section className="py-16 md:py-[100px] px-6 md:px-12">
        <div className="flex justify-between items-end mb-14">
          <div>
            <h2 className="font-serif text-[clamp(32px,3.5vw,52px)] font-light leading-[1.1]">
              Subscribe to Your Favorite
            </h2>
            <p className="text-sm text-warm-gray mt-3 max-w-[400px]">
              Choose any fragrance from our collection to start your subscription
            </p>
          </div>
          <Link
            to="/shop"
            className="font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline border-b border-black pb-1 transition-opacity duration-300 hover:opacity-50 shrink-0"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {subscribableProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 md:py-[100px] px-6 md:px-12 bg-light-gray">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-[clamp(32px,3.5vw,52px)] font-light leading-[1.1] mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-warm-gray">Everything you need to know about ALMAS subscriptions</p>
          </div>
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-black/[0.08]">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between py-5 text-left bg-transparent border-none cursor-pointer"
                >
                  <span className="font-serif text-lg font-normal pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-warm-gray shrink-0 transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-[200px] pb-5' : 'max-h-0'
                  }`}
                >
                  <p className="text-sm leading-[1.8] text-warm-gray max-w-[600px]">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GIFT SUBSCRIPTION CTA ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[50vh]">
        <div className="bg-stone flex items-center justify-center relative overflow-hidden">
          <div className="text-center font-serif">
            <Gift className="w-16 h-16 text-black/[0.12] mx-auto mb-4" strokeWidth={1} />
            <div className="text-xl text-black/[0.15]">The Perfect Gift</div>
          </div>
        </div>
        <div className="flex flex-col justify-center p-8 md:p-20 bg-black text-white">
          <span className="text-[9px] tracking-[0.15em] uppercase border border-white/20 inline-block px-3.5 py-1.5 mb-6 w-fit">
            Gift Subscription
          </span>
          <h2 className="font-serif text-[clamp(28px,3vw,40px)] font-light leading-[1.15] mb-4">
            Give the Gift of ALMAS
          </h2>
          <p className="text-sm leading-[1.7] text-white/60 mb-8 max-w-[380px]">
            Surprise someone special with a luxury fragrance subscription. Choose their scent, add a personal message, and we'll handle the rest — beautifully wrapped and delivered to their door.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline px-10 py-4 bg-white transition-all duration-400 hover:bg-stone w-fit group"
          >
            Gift a Subscription
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  )
}
