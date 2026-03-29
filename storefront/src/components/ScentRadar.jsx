/**
 * ScentRadar — SVG radar/spider chart showing accord profile.
 * Standard fragrance industry visualization. Pure SVG, no library needed.
 */
import { getAccentColor } from '../utils/scentTheme'

export default function ScentRadar({ accords = [], product }) {
  if (accords.length < 3) return null

  const cx = 150
  const cy = 150
  const radius = 120
  const items = accords.slice(0, 5)
  const count = items.length
  const accent = product ? getAccentColor(product) : '#7A5C3E'

  // Calculate vertex positions
  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2
    const r = (value / 100) * radius
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    }
  }

  // Outer boundary points
  const outerPoints = items.map((_, i) => getPoint(i, 100))
  const outerPath = outerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  // Inner grid rings
  const rings = [25, 50, 75]

  // Data polygon
  const dataPoints = items.map((a, i) => getPoint(i, a.strength))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  // Label positions
  const labelPoints = items.map((a, i) => {
    const pt = getPoint(i, 115)
    return { ...pt, name: a.name }
  })

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[280px]">
        {/* Grid rings */}
        {rings.map((r) => {
          const pts = items.map((_, i) => getPoint(i, r))
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
          return <path key={r} d={path} fill="none" stroke="#E8E4DF" strokeWidth="0.5" />
        })}

        {/* Outer boundary */}
        <path d={outerPath} fill="none" stroke="#D4CFC8" strokeWidth="1" />

        {/* Axis lines */}
        {outerPoints.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E8E4DF" strokeWidth="0.5" />
        ))}

        {/* Data polygon */}
        <path d={dataPath} fill={accent} fillOpacity="0.12" stroke={accent} strokeOpacity="0.5" strokeWidth="1.5" />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={accent} fillOpacity="0.7" />
        ))}

        {/* Labels */}
        {labelPoints.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-warm-gray"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fill: '#9A948D' }}
          >
            {p.name}
          </text>
        ))}
      </svg>
    </div>
  )
}
