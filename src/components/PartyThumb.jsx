import { getTheme } from '../lib/themes'

const GRADIENTS = {
  kids: 'from-pink-400 via-amber-300 to-sky-400',
  wedding: 'from-[#efe3da] via-[#e2c9b8] to-[#c9d8d1]',
  neon: 'from-[#2a0a3d] via-[#7c3aed] to-[#ff2bd6]',
  minimal: 'from-neutral-100 via-stone-200 to-neutral-300',
}

/** Miniatura da festa: foto de capa ou gradiente do tema */
export default function PartyThumb({ party, className = '' }) {
  const theme = getTheme(party.theme)
  if (party.coverImage) {
    return <img src={party.coverImage} alt="" className={`h-full w-full object-cover ${className}`} loading="lazy" />
  }
  return (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br ${GRADIENTS[theme.id]} ${className}`}>
      <span className="text-5xl drop-shadow-md">{theme.emoji}</span>
    </div>
  )
}
