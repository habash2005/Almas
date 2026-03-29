export default function AccordBar({ accords = [], size = 'default' }) {
  if (!accords.length) return null

  const isLarge = size === 'large'

  return (
    <div>
      {/* NOTES header with underline */}
      <div className={`${isLarge ? 'text-[15px] tracking-[0.15em] mb-6' : 'text-[10px] tracking-[0.12em] mb-3'} uppercase text-warm-gray font-normal`}>
        <span className="border-b border-warm-gray/40 pb-1">NOTES</span>
      </div>

      {/* Note rows */}
      <div className={`flex flex-col ${isLarge ? 'gap-5' : 'gap-2.5'}`}>
        {accords.map((accord) => (
          <div key={accord.name} className="flex items-center justify-between">
            {/* Note name */}
            <span className={`${isLarge ? 'text-[16px]' : 'text-[11px]'} text-black font-normal`}>
              {accord.name}
            </span>
            {/* Solid colored rounded pill */}
            <div
              className={`${isLarge ? 'w-[70px] h-[24px]' : 'w-[40px] h-[14px]'} rounded-full`}
              style={{ backgroundColor: accord.color }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
