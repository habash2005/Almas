import { useState, useEffect } from 'react'

export default function AccordBar({ accords = [], size = 'default' }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!accords.length) return null

  const isLarge = size === 'large'

  // Sort by strength descending; default shows top 4, large shows all
  const sorted = [...accords].sort((a, b) => b.strength - a.strength)
  const visible = isLarge ? sorted : sorted.slice(0, 4)

  return (
    <div>
      {/* ACCORDS header with underline */}
      <div
        className={`${
          isLarge
            ? 'text-[14px] tracking-[0.15em] mb-6'
            : 'text-[10px] tracking-[0.12em] mb-3'
        } uppercase text-warm-gray font-normal`}
      >
        <span className="border-b border-warm-gray/40 pb-1">ACCORDS</span>
      </div>

      {/* Accord rows */}
      <div className={`flex flex-col ${isLarge ? 'gap-3.5' : 'gap-2'}`}>
        {visible.map((accord, i) => (
          <div key={accord.name} className="flex items-center gap-2">
            {/* Accord name */}
            <span
              className={`${
                isLarge ? 'text-[14px]' : 'text-[11px]'
              } text-black font-normal shrink-0 ${
                isLarge ? 'w-[80px]' : 'w-[56px]'
              }`}
            >
              {accord.name}
            </span>

            {/* Bar track */}
            <div
              className={`${
                isLarge ? 'h-[8px]' : 'h-[6px]'
              } bg-[#E8E4DF]/40 rounded-full flex-1`}
            >
              {/* Bar fill */}
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: animated ? `${accord.strength}%` : '0%',
                  backgroundColor: accord.color,
                  transitionDelay: `${i * 100}ms`,
                }}
              />
            </div>

            {/* Strength number — large only */}
            {isLarge && (
              <span className="text-[10px] text-warm-gray w-[24px] text-right shrink-0">
                {accord.strength}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
