import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const values = [
  {
    title: 'Craftsmanship',
    description:
      'Every bottle is a work of art. We meticulously blend each fragrance to capture the DNA of the world\'s most coveted luxury scents, ensuring uncompromising quality in every drop.',
  },
  {
    title: 'Accessibility',
    description:
      'Luxury should not be exclusive. We make world-class fragrance experiences accessible to everyone, offering premium quality at a fraction of designer prices.',
  },
  {
    title: 'Sustainability',
    description:
      'We are committed to responsible sourcing and eco-conscious packaging. Our subscription model reduces waste and ensures you always have your signature scent.',
  },
  {
    title: 'Community',
    description:
      'ALMAS is more than a brand \u2014 it\'s a community of fragrance lovers. We celebrate the diversity of scent preferences and the stories they tell.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="min-h-[70vh] flex items-center justify-center text-center bg-light-gray px-6 md:px-12 py-32 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center font-serif text-[160px] text-black/[0.03]">
          {'\u25C6'}
        </div>
        <div className="relative z-[2] max-w-[700px]">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-8 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-warm-gray" />
            Our Story
            <span className="w-8 h-px bg-warm-gray" />
          </p>
          <h1 className="font-serif text-[clamp(48px,6vw,80px)] font-light leading-[1.05] mb-6 tracking-[-0.02em]">
            The ALMAS Story
          </h1>
          <p className="text-[15px] leading-[1.8] text-warm-gray max-w-[500px] mx-auto font-light">
            A journey from inspiration to creation, crafting luxury fragrances that capture the brilliance and beauty of rare diamonds.
          </p>
        </div>
      </section>

      {/* ===== EDITORIAL BLOCK 1 — Image Left ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
        <div className="bg-stone relative overflow-hidden">
          <img src="/images/lifestyle-spray.png" alt="ALMAS fragrance" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-20">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-7 flex items-center gap-3">
            <span className="w-8 h-px bg-warm-gray" />
            The Beginning
          </p>
          <h2 className="font-serif text-[clamp(28px,3vw,44px)] font-light leading-[1.15] mb-5">
            Born from a Love of Luxury Fragrance
          </h2>
          <p className="text-[15px] leading-[1.8] text-warm-gray max-w-[420px] mb-4 font-light">
            ALMAS was founded with a singular vision: to make the world's finest fragrance experiences accessible to everyone. The name "Almas" — meaning diamond in Arabic — reflects our belief that every person deserves to wear a scent that feels as precious and brilliant as a rare gem.
          </p>
          <p className="text-[15px] leading-[1.8] text-warm-gray max-w-[420px] font-light">
            Our master perfumers study the DNA of the world's most coveted luxury fragrances, then meticulously recreate them using premium ingredients sourced from the finest suppliers around the globe.
          </p>
        </div>
      </section>

      {/* ===== EDITORIAL BLOCK 2 — Image Right ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
        <div className="flex flex-col justify-center p-8 md:p-20 bg-light-gray">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-7 flex items-center gap-3">
            <span className="w-8 h-px bg-warm-gray" />
            The Process
          </p>
          <h2 className="font-serif text-[clamp(28px,3vw,44px)] font-light leading-[1.15] mb-5">
            Meticulous Craftsmanship in Every Drop
          </h2>
          <p className="text-[15px] leading-[1.8] text-warm-gray max-w-[420px] mb-4 font-light">
            Each ALMAS fragrance undergoes over 200 hours of development. Our team of experienced perfumers deconstruct original compositions note by note, then rebuild them using the highest quality ingredients — from French-sourced iris to sustainably harvested oud.
          </p>
          <p className="text-[15px] leading-[1.8] text-warm-gray max-w-[420px] font-light">
            The result is a fragrance that captures the essence, longevity, and sillage of its inspiration, presented in beautifully designed bottles that reflect the elegance within.
          </p>
        </div>
        <div className="bg-stone relative overflow-hidden">
          <img src="/images/ingredients.png" alt="Premium fragrance ingredients" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </section>

      {/* ===== THE DIAMOND NARRATIVE ===== */}
      <section className="py-[120px] px-6 md:px-12 text-center">
        <div className="max-w-[600px] mx-auto">
          <div className="text-5xl text-stone mb-8">{'\u25C6'}</div>
          <h2 className="font-serif text-[clamp(32px,4vw,52px)] font-light leading-[1.15] mb-6">
            Like a Diamond, Every Facet Matters
          </h2>
          <p className="text-[15px] leading-[1.8] text-warm-gray font-light">
            Just as a diamond is shaped by precision and pressure, each ALMAS fragrance is the result of countless refinements. From the first burst of top notes to the lingering base, every layer has been carefully calibrated to create a scent that's as multifaceted and enduring as a precious stone.
          </p>
        </div>
      </section>

      {/* ===== BRAND VALUES ===== */}
      <section className="py-[100px] px-6 md:px-12 bg-light-gray">
        <div className="text-center mb-16">
          <h2 className="font-serif text-[clamp(32px,3.5vw,52px)] font-light leading-[1.1] mb-3">Our Values</h2>
          <p className="text-sm text-warm-gray max-w-[400px] mx-auto">
            The principles that guide every bottle we create
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-[900px] mx-auto">
          {values.map((value) => (
            <div
              key={value.title}
              className="p-10 border border-black/[0.06] bg-white transition-colors duration-300 hover:border-black/[0.15]"
            >
              <h3 className="font-serif text-2xl font-light mb-4">{value.title}</h3>
              <p className="text-sm leading-[1.8] text-warm-gray">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== EDITORIAL BLOCK 3 — Full Width CTA ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
        <div className="bg-stone relative overflow-hidden">
          <img src="/images/hero-bottle.png" alt="ALMAS collection" className="absolute inset-0 w-full h-full object-cover object-center" />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-20 bg-black text-white">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-white/50 mb-7 flex items-center gap-3">
            <span className="w-8 h-px bg-white/30" />
            140+ Fragrances
          </p>
          <h2 className="font-serif text-[clamp(28px,3vw,44px)] font-light leading-[1.15] mb-5">
            Discover Your Signature Scent
          </h2>
          <p className="text-[15px] leading-[1.8] text-white/50 max-w-[420px] mb-9 font-light">
            From bold and magnetic to soft and ethereal, our collection spans every mood, season, and personality. Find the fragrance that speaks to you.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline px-10 py-4 bg-white transition-all duration-400 hover:bg-stone w-fit group"
          >
            Shop the Collection
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  )
}
