/**
 * ScentSilhouette — abstract visual placeholder for products without images.
 * Creates a unique composition from accord colors/strengths: layered blurred
 * circles that form a "scent aura" unique to each product.
 */
export default function ScentSilhouette({ accords = [], scentFamily = 'Woody' }) {
  const sorted = [...accords].sort((a, b) => b.strength - a.strength)

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-light-gray to-white">
      {sorted.map((accord, i) => {
        const size = 35 + (accord.strength / 100) * 55
        const opacity = 0.14 - i * 0.02
        return (
          <div
            key={accord.name}
            className="absolute rounded-full"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              backgroundColor: accord.color,
              opacity: Math.max(opacity, 0.04),
              filter: `blur(${12 + i * 6}px)`,
              transform: `translate(${(i % 2 === 0 ? -1 : 1) * i * 4}%, ${i * 3}%)`,
            }}
          />
        )
      })}
      {/* Scent family initial */}
      <span className="relative z-10 font-serif text-[36px] font-light text-black/20 tracking-[0.1em]">
        {scentFamily?.[0] || 'A'}
      </span>
    </div>
  )
}
