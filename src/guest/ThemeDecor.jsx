// Elementos decorativos de fundo por tema (pointer-events: none)
const KIDS = [
  { c: '🎈', l: '6%', t: '8%', s: 34, d: 0, r: '-8deg' },
  { c: '⭐', l: '86%', t: '14%', s: 22, d: 1.2, r: '12deg' },
  { c: '🎉', l: '82%', t: '52%', s: 28, d: 0.6, r: '-6deg' },
  { c: '🎈', l: '4%', t: '62%', s: 26, d: 2, r: '10deg' },
  { c: '✨', l: '48%', t: '3%', s: 18, d: 1.6, r: '0deg' },
  { c: '🍭', l: '90%', t: '84%', s: 24, d: 0.9, r: '-14deg' },
]

export default function ThemeDecor({ theme, compact = false }) {
  const pos = compact ? 'absolute' : 'fixed'

  if (theme === 'kids') {
    return (
      <div aria-hidden className={`${pos} pointer-events-none inset-0 z-0 overflow-hidden`}>
        {KIDS.map((e, i) => (
          <span
            key={i}
            className="float-y absolute select-none opacity-80"
            style={{
              left: e.l,
              top: e.t,
              fontSize: compact ? e.s * 0.6 : e.s,
              animationDelay: `${e.d}s`,
              '--r': e.r,
            }}
          >
            {e.c}
          </span>
        ))}
        {/* confete estático */}
        <svg className="absolute inset-0 h-full w-full opacity-50" preserveAspectRatio="none">
          {Array.from({ length: 22 }).map((_, i) => (
            <circle
              key={i}
              cx={`${(i * 37) % 100}%`}
              cy={`${(i * 53) % 100}%`}
              r={compact ? 2 : 3.5}
              fill={['#ff5d8f', '#ffd23f', '#3bceac', '#5b8cff'][i % 4]}
            />
          ))}
        </svg>
      </div>
    )
  }

  if (theme === 'wedding') {
    return (
      <div aria-hidden className={`${pos} pointer-events-none inset-0 z-0 overflow-hidden`}>
        <svg className="absolute -left-10 -top-10 w-56 opacity-40" viewBox="0 0 200 200" fill="none" stroke="#b48a78" strokeWidth="1.2">
          <path d="M10 190 C 60 120, 90 80, 190 10" />
          {[30, 55, 80, 105, 130, 155].map((p, i) => (
            <ellipse key={i} cx={p} cy={200 - p * 1.05} rx="14" ry="6" transform={`rotate(${i % 2 ? 40 : -50} ${p} ${200 - p * 1.05})`} />
          ))}
        </svg>
        <svg className="absolute -bottom-10 -right-10 w-56 rotate-180 opacity-40" viewBox="0 0 200 200" fill="none" stroke="#8aa39b" strokeWidth="1.2">
          <path d="M10 190 C 60 120, 90 80, 190 10" />
          {[30, 55, 80, 105, 130, 155].map((p, i) => (
            <ellipse key={i} cx={p} cy={200 - p * 1.05} rx="14" ry="6" transform={`rotate(${i % 2 ? 40 : -50} ${p} ${200 - p * 1.05})`} />
          ))}
        </svg>
      </div>
    )
  }

  if (theme === 'neon') {
    return (
      <div aria-hidden className={`${pos} pointer-events-none inset-0 z-0 overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,240,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,43,214,.6) 1px, transparent 1px)',
            backgroundSize: compact ? '22px 22px' : '38px 38px',
            maskImage: 'linear-gradient(to bottom, transparent, black 70%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 70%)',
          }}
        />
        <div className="float-y absolute -left-16 top-1/4 h-48 w-48 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="float-y absolute -right-16 top-2/3 h-48 w-48 rounded-full bg-cyan-400/25 blur-3xl" style={{ animationDelay: '1.5s' }} />
      </div>
    )
  }

  // minimal
  return (
    <div aria-hidden className={`${pos} pointer-events-none inset-0 z-0 overflow-hidden`}>
      <div className="absolute left-[8%] top-0 h-full w-px bg-black/[0.05]" />
      <div className="absolute right-[8%] top-0 h-full w-px bg-black/[0.05]" />
      <div className="absolute -right-24 top-24 h-64 w-64 rounded-full border border-[#c8a96a]/30" />
    </div>
  )
}
