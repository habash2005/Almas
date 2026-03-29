import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center text-center bg-light-gray px-12 py-32 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 flex items-center justify-center font-serif text-[200px] text-black/[0.03] select-none pointer-events-none">
        404
      </div>

      <div className="relative z-[2] max-w-[500px]">
        {/* Brand mark */}
        <div className="font-serif text-2xl font-light tracking-[0.08em] mb-2">ALMAS</div>
        <div className="font-serif text-base mb-12">{'\u0627\u0644\u0645\u0627\u0633'}</div>

        <h1 className="font-serif text-[clamp(36px,4vw,56px)] font-light leading-[1.1] mb-4">
          Page Not Found
        </h1>
        <p className="text-[15px] leading-[1.7] text-warm-gray mb-10 font-light">
          The page you're looking for doesn't exist or has been moved. Let us help you find your way back.
        </p>

        <div className="flex gap-4 items-center justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-white no-underline px-10 py-4 bg-black transition-all duration-400 hover:bg-[#333] group"
          >
            Back to Home
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 font-sans text-[11px] tracking-[0.15em] uppercase text-black no-underline px-10 py-4 border border-black transition-all duration-400 hover:bg-black hover:text-white"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  )
}
