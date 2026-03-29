import { Link } from 'react-router-dom'
import { ArrowRight, Sun, Check } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

const marqueeItems = [
  'Free Shipping Over $100',
  'Premium Quality',
  '3-Month Auto Refill',
  '140+ Scents',
  'Satisfaction Guaranteed',
]

const categories = [
  { name: 'For Him', count: 45, slug: 'men', image: '/images/category-him.png' },
  { name: 'For Her', count: 41, slug: 'women', image: '/images/category-her.png' },
  { name: 'Unisex', count: 57, slug: 'unisex', image: '/images/ingredients.png' },
]

const testimonials = [
  {
    stars: 5,
    quote: 'Absolutely enchanting. The perfect blend of floral and woody notes. I get compliments every time.',
    author: 'Sarah M.',
  },
  {
    stars: 5,
    quote: 'Luxurious and long-lasting. The subscription is a game-changer \u2014 never running out again.',
    author: 'Ahmed K.',
  },
  {
    stars: 5,
    quote: 'A true gem. Sophisticated, elegant, and the presentation is beautiful. Perfect gift.',
    author: 'Nadia L.',
  },
]

const scentNotes = [
  {
    icon: '\u25B2',
    name: 'Top Notes',
    desc: 'The first impression. Bright citrus, aromatic herbs, and sparkling aldehydes that captivate.',
  },
  {
    icon: '\u25C6',
    name: 'Heart Notes',
    desc: 'The soul. Rich florals, warm spices, and precious woods that define character.',
  },
  {
    icon: '\u25CF',
    name: 'Base Notes',
    desc: 'The signature. Deep musk, amber, and oud that linger on skin for hours.',
  },
]

export default function HomePage() {
  const bestSellers = products.filter((p) => p.badge === 'Best Seller').slice(0, 4)
  const newArrivals = products.filter((p) => p.badge === 'New').slice(0, 4)

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="min-h-[92vh] flex items-center px-12 py-20 bg-light-gray relative overflow-hidden">
        <div className="flex-1 max-w-[560px] z-[2]">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-8 flex items-center gap-3">
            <span className="w-8 h-px bg-warm-gray" />
            Eau de Parfum
          </p>
          <h1 className="font-serif text-[clamp(52px,6.5vw,88px)] font-light leading-[1.05] mb-6 tracking-[-0.02em]">
            The Art of
            <br />
            <em className="italic font-light">Fragrance</em>
          </h1>
          <p className="text-[15px] leading-[1.7] text-warm-gray max-w-[400px] mb-12 font-light">
            Luxury-inspired scents, meticulously crafted to capture the essence of the world's most coveted fragrances.
          </p>
          <div className="flex gap-4 items-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-white no-underline px-10 py-4 bg-black transition-all duration-400 hover:bg-[#333] group"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/scent-finder"
              className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline px-10 py-4 border border-black transition-all duration-400 hover:bg-black hover:text-white"
            >
              Scent Finder
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center relative z-[1]">
          <div className="relative">
            <div className="absolute -inset-10 border border-black/[0.06] pointer-events-none" />
            <div className="absolute -bottom-[60px] left-1/2 -translate-x-1/2 w-[200px] h-10 bg-black/[0.04] rounded-full blur-[20px]" />
            <img src="/images/bottle-transparent.png" alt="ALMAS Eau de Parfum" className="w-[360px] h-auto object-contain relative z-[1]" />
          </div>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="py-6 border-t border-b border-black/[0.06] overflow-hidden whitespace-nowrap">
        <div className="inline-flex gap-16 animate-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="font-sans text-[11px] tracking-[0.15em] uppercase text-warm-gray flex items-center gap-4"
            >
              {item}
              <span className="w-1 h-1 bg-stone-dark rounded-full" />
            </span>
          ))}
        </div>
      </div>

      {/* ===== SUBSCRIPTION PROMO BANNER ===== */}
      <section className="pt-20 px-12">
        <div className="grid grid-cols-2 min-h-[320px] overflow-hidden cursor-pointer">
          {/* Left image */}
          <div className="relative overflow-hidden">
            <img src="/images/subscription.png" alt="ALMAS Subscription" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          {/* Right content */}
          <div className="flex flex-col justify-center px-16 py-14 bg-black text-white">
            <span className="text-[9px] tracking-[0.15em] uppercase border border-white/20 inline-block px-3.5 py-1.5 mb-6 w-fit">
              New — Subscribe & Save
            </span>
            <h2 className="font-serif text-[clamp(28px,3vw,40px)] font-light leading-[1.15] mb-4">
              Your Signature,
              <br />
              Delivered Every 3 Months
            </h2>
            <p className="text-sm leading-[1.7] text-white/60 mb-8 max-w-[380px]">
              Lock in your favorite ALMAS fragrance with our auto-refill subscription. Save 15% on every delivery, skip or cancel anytime.
            </p>
            <Link
              to="/subscribe"
              className="font-sans text-[11px] tracking-[0.15em] uppercase text-white no-underline border-b border-white pb-1 inline-block w-fit transition-opacity duration-300 hover:opacity-60"
            >
              Learn More &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-[100px] px-12">
        <div className="flex justify-between items-end mb-14">
          <div>
            <h2 className="font-serif text-[clamp(32px,3.5vw,52px)] font-light leading-[1.1]">Shop by Category</h2>
            <p className="text-sm text-warm-gray mt-3 max-w-[400px]">Find your signature from our curated collections</p>
          </div>
          <Link
            to="/shop"
            className="font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline border-b border-black pb-1 transition-opacity duration-300 hover:opacity-50 shrink-0"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop/${cat.slug}`}
              className="relative aspect-[3/4] overflow-hidden bg-stone cursor-pointer group no-underline"
            >
              {/* Category image */}
              <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-9 bg-gradient-to-t from-[rgba(10,10,10,0.5)] to-transparent transition-all duration-400 group-hover:from-[rgba(10,10,10,0.7)] group-hover:to-[rgba(10,10,10,0.15)]">
                {/* Arrow */}
                <span className="absolute top-6 right-6 w-10 h-10 border border-white/25 rounded-full flex items-center justify-center transition-all duration-300 text-white text-lg group-hover:bg-white group-hover:border-white group-hover:text-black">
                  {'\u2197'}
                </span>
                <h3 className="font-serif text-[28px] font-light text-white mb-1.5">{cat.name}</h3>
                <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-white/60">{cat.count} Fragrances</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== DUAL BANNERS — Row 1 ===== */}
      <div className="grid grid-cols-2 gap-5 px-12">
        {/* Spring Collection */}
        <Link to="/shop" className="relative aspect-video overflow-hidden bg-stone cursor-pointer group no-underline">
          <img src="/images/spring-collection.png" alt="Spring Collection" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-9 text-white">
            <span className="text-[9px] tracking-[0.15em] uppercase text-white/70 mb-2.5">Limited Edition</span>
            <h3 className="font-serif text-[26px] font-light mb-1.5">Spring Collection 2026</h3>
            <span className="text-[11px] tracking-[0.1em] uppercase text-white no-underline mt-3 inline-flex items-center gap-2">
              Shop Now &rarr;
            </span>
          </div>
        </Link>
        {/* Best Sellers */}
        <Link to="/shop" className="relative aspect-video overflow-hidden bg-black cursor-pointer group no-underline">
          <img src="/images/lifestyle-spray.png" alt="Best Sellers" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-9 text-white">
            <span className="text-[9px] tracking-[0.15em] uppercase text-white/50 mb-2.5">Most Loved</span>
            <h3 className="font-serif text-[26px] font-light mb-1.5">Our Top 10 Best Sellers</h3>
            <span className="text-[11px] tracking-[0.1em] uppercase text-white no-underline mt-3 inline-flex items-center gap-2">
              Explore &rarr;
            </span>
          </div>
        </Link>
      </div>

      {/* ===== BEST SELLERS ===== */}
      <section className="py-[100px] px-12">
        <div className="flex justify-between items-end mb-14">
          <div>
            <h2 className="font-serif text-[clamp(32px,3.5vw,52px)] font-light leading-[1.1]">Best Sellers</h2>
            <p className="text-sm text-warm-gray mt-3 max-w-[400px]">Our most loved fragrances, chosen by you</p>
          </div>
          <Link
            to="/shop"
            className="font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline border-b border-black pb-1 transition-opacity duration-300 hover:opacity-50 shrink-0"
          >
            Shop All
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ===== FULL-WIDTH SCENT FINDER BANNER ===== */}
      <div className="relative min-h-[400px] flex items-center justify-center text-center overflow-hidden mx-12">
        <img src="/images/ingredients.png" alt="Fragrance Ingredients" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-white/60" />
        <div className="relative z-[2] py-20 px-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray mb-5">Scent Finder</p>
          <h2 className="font-serif text-[clamp(32px,4vw,56px)] font-light mb-4">Not Sure Where to Start?</h2>
          <p className="text-sm text-warm-gray mb-8 max-w-[500px] mx-auto">
            Take our quiz and discover the perfect ALMAS fragrance for your personality and lifestyle.
          </p>
          <Link
            to="/scent-finder"
            className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-white no-underline px-10 py-4 bg-black transition-all duration-400 hover:bg-[#333] group"
          >
            Take the Quiz
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ===== SUBSCRIPTION DETAIL SECTION ===== */}
      <section className="py-[100px] px-12">
        <div className="grid grid-cols-2 border border-black/[0.08] overflow-hidden">
          {/* Left — subscription visual */}
          <div className="bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
            <img src="/images/subscription.png" alt="ALMAS Subscription" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-[1] text-center">
              <h3 className="font-serif text-4xl font-light mb-3">Every 3 Months</h3>
              <p className="text-[13px] text-white/70">Your signature, on autopilot</p>
            </div>
          </div>
          {/* Right — features */}
          <div className="flex flex-col justify-center py-16 px-[72px] bg-light-gray">
            <p className="text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-6">ALMAS Refill Club</p>
            <h2 className="font-serif text-[clamp(28px,3vw,40px)] font-light leading-[1.15] mb-5">
              Never Run Out of Your Signature Scent
            </h2>
            <p className="text-sm leading-[1.8] text-warm-gray mb-8 max-w-[400px]">
              Subscribe to your favorite fragrance and receive a fresh bottle every 3 months. Effortless, affordable, always on time.
            </p>
            <ul className="list-none mb-9">
              {[
                'Save 15% on every delivery',
                'Free shipping on all subscription orders',
                'Skip, swap, or cancel anytime',
                'Exclusive early access to new releases',
              ].map((feature) => (
                <li
                  key={feature}
                  className="text-[13px] text-black py-2.5 border-b border-black/[0.06] flex items-center gap-3"
                >
                  <span className="w-[18px] h-[18px] rounded-full bg-black text-white flex items-center justify-center text-[10px] shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to="/subscribe"
              className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-white no-underline px-10 py-4 bg-black transition-all duration-400 hover:bg-[#333] w-fit group"
            >
              Subscribe Now
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== EDITORIAL — OUR STORY ===== */}
      <section className="grid grid-cols-2 min-h-[70vh]">
        {/* Left image */}
        <div className="relative overflow-hidden">
          <img src="/images/lifestyle-spray.png" alt="ALMAS Lifestyle" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        {/* Right content */}
        <div className="flex flex-col justify-center p-20">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-7 flex items-center gap-3">
            <span className="w-8 h-px bg-warm-gray" />
            Our Philosophy
          </p>
          <h2 className="font-serif text-[clamp(28px,3vw,44px)] font-light leading-[1.15] mb-5">
            Inspired by the Elegance of Rare Diamonds
          </h2>
          <p className="text-[15px] leading-[1.8] text-warm-gray max-w-[420px] mb-9 font-light">
            Almas — meaning diamond in Arabic — represents the pinnacle of craftsmanship. Each fragrance is meticulously composed to capture the DNA of the world's most beloved luxury scents.
          </p>
          <Link
            to="/our-story"
            className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline px-10 py-4 border border-black transition-all duration-400 hover:bg-black hover:text-white w-fit group"
          >
            Our Story
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section className="py-[100px] px-12 bg-light-gray">
        <div className="flex justify-between items-end mb-14">
          <div>
            <h2 className="font-serif text-[clamp(32px,3.5vw,52px)] font-light leading-[1.1]">New Arrivals</h2>
            <p className="text-sm text-warm-gray mt-3 max-w-[400px]">The latest additions to the ALMAS collection</p>
          </div>
          <Link
            to="/shop"
            className="font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline border-b border-black pb-1 transition-opacity duration-300 hover:opacity-50 shrink-0"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ===== DUAL BANNERS — Row 2 ===== */}
      <div className="grid grid-cols-2 gap-5 px-12 pt-20">
        {/* Discovery Sets */}
        <Link to="/shop" className="relative aspect-video overflow-hidden bg-black cursor-pointer group no-underline">
          <img src="/images/discovery-sets.png" alt="Discovery Sets" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-9 text-white">
            <span className="text-[9px] tracking-[0.15em] uppercase text-white/50 mb-2.5">Gift Idea</span>
            <h3 className="font-serif text-[26px] font-light mb-1.5">Discovery Sample Sets</h3>
            <span className="text-[11px] tracking-[0.1em] uppercase text-white no-underline mt-3 inline-flex items-center gap-2">
              Shop Sets &rarr;
            </span>
          </div>
        </Link>
        {/* Ramadan Gift Guide */}
        <Link to="/shop" className="relative aspect-video overflow-hidden bg-black cursor-pointer group no-underline">
          <img src="/images/ramadan.png" alt="Ramadan Gift Guide" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-9 text-white">
            <span className="text-[9px] tracking-[0.15em] uppercase text-white/60 mb-2.5">Seasonal</span>
            <h3 className="font-serif text-[26px] font-light mb-1.5">Ramadan Gift Guide</h3>
            <span className="text-[11px] tracking-[0.1em] uppercase text-white no-underline mt-3 inline-flex items-center gap-2">
              Explore &rarr;
            </span>
          </div>
        </Link>
      </div>

      {/* ===== SCENT NOTES ===== */}
      <section className="bg-black text-white py-[100px] px-12 mt-20">
        <h2 className="font-serif text-[clamp(32px,3.5vw,52px)] font-light leading-[1.1] text-center mb-3">
          The Art of Composition
        </h2>
        <p className="text-center text-white/35 text-sm">Every fragrance tells a story through its layers</p>
        <div className="grid grid-cols-3 gap-10 mt-14">
          {scentNotes.map((note) => (
            <div key={note.name} className="text-center">
              <div className="w-[72px] h-[72px] rounded-full border border-white/[0.12] mx-auto mb-5 flex items-center justify-center text-2xl">
                {note.icon}
              </div>
              <h3 className="font-serif text-xl font-normal mb-2.5">{note.name}</h3>
              <p className="text-[13px] text-white/45 leading-[1.6] max-w-[260px] mx-auto">{note.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-[100px] px-12">
        <div className="flex justify-between items-end mb-14">
          <div>
            <h2 className="font-serif text-[clamp(32px,3.5vw,52px)] font-light leading-[1.1]">What Our Customers Say</h2>
            <p className="text-sm text-warm-gray mt-3 max-w-[400px]">Real reviews from the ALMAS community</p>
          </div>
          <Link
            to="/shop"
            className="font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline border-b border-black pb-1 transition-opacity duration-300 hover:opacity-50 shrink-0"
          >
            All Reviews
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="p-10 border border-black/[0.06] transition-colors duration-300 hover:border-black/[0.15]"
            >
              <div className="text-[13px] tracking-[3px] mb-5 text-black">
                {Array.from({ length: t.stars }, (_, i) => (
                  <span key={i}>{'\u2605'}</span>
                ))}
              </div>
              <p className="font-serif text-lg font-normal italic leading-[1.5] mb-6">"{t.quote}"</p>
              <p className="text-[11px] tracking-[0.1em] uppercase text-warm-gray">{t.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="bg-light-gray py-[100px] px-12 text-center">
        <h2 className="font-serif text-[clamp(28px,3vw,40px)] font-light mb-3">Stay in the Know</h2>
        <p className="text-sm text-warm-gray mb-10">
          New releases, exclusive offers, and the art of fragrance — delivered to your inbox.
        </p>
        <form
          className="flex max-w-[480px] mx-auto border border-black"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-5 py-4 border-none bg-transparent font-sans text-[13px] outline-none"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-black text-white border-none font-sans text-[11px] tracking-[0.15em] uppercase cursor-pointer transition-opacity duration-300 hover:opacity-80"
          >
            Subscribe
          </button>
        </form>
      </section>
    </>
  )
}
