// ────────────────────────────────────────────────────────────
// Presets visuais do convite. Cores/tipografia vivem em CSS
// variables (ver src/index.css → .theme-*). Aqui ficam os
// metadados usados pelo construtor, envelope e confetes.
// ────────────────────────────────────────────────────────────

export const THEMES = {
  kids: {
    id: 'kids',
    name: 'Infantil Divertido',
    tagline: 'Cores vivas, lúdico e festivo',
    emoji: '🎈',
    seal: '🎈',
    className: 'theme-kids',
    swatch: ['#ff5d8f', '#ffd23f', '#3bceac', '#5b8cff'],
    confetti: ['#ff5d8f', '#ffd23f', '#3bceac', '#5b8cff', '#ff9f1c'],
    fonts: 'family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800',
    invitedLabel: 'Oba! Você foi convidado(a) para',
  },
  wedding: {
    id: 'wedding',
    name: 'Casamento & Bodas Elegante',
    tagline: 'Fontes fluidas, tons pastéis e bordas finas',
    emoji: '💍',
    seal: '♡',
    className: 'theme-wedding',
    swatch: ['#f6efe7', '#d9b8a6', '#b48a78', '#8aa39b'],
    confetti: ['#f3d9cf', '#e8c4b0', '#d4af7a', '#ffffff', '#c9d8d1'],
    fonts: 'family=Great+Vibes&family=Cormorant+Garamond:wght@400;500;600;700',
    invitedLabel: 'Com alegria, convidamos você para',
  },
  neon: {
    id: 'neon',
    name: 'Balada / Neon Party',
    tagline: 'Fundo escuro, neon e muita energia',
    emoji: '🪩',
    seal: '⚡',
    className: 'theme-neon',
    swatch: ['#0a0614', '#ff2bd6', '#00f0ff', '#b6ff00'],
    confetti: ['#ff2bd6', '#00f0ff', '#b6ff00', '#7c3aed', '#ffffff'],
    fonts: 'family=Righteous&family=Space+Grotesk:wght@400;500;600;700',
    invitedLabel: 'Prepare-se! Você está na lista de',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimalista Chic',
    tagline: 'Clean, moderno, tipografia marcante',
    emoji: '✦',
    seal: '✦',
    className: 'theme-minimal',
    swatch: ['#ffffff', '#f2f0eb', '#111111', '#c8a96a'],
    confetti: ['#111111', '#c8a96a', '#d9d6cf', '#ffffff'],
    fonts: 'family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:wght@400;500;700',
    invitedLabel: 'Você está convidado(a) para',
  },
}

export const THEME_LIST = Object.values(THEMES)
export const getTheme = (id) => THEMES[id] || THEMES.kids

/** Carrega sob demanda apenas as fontes do tema (página do convidado fica leve). */
const loaded = new Set()
export function loadThemeFonts(id) {
  const theme = getTheme(id)
  if (loaded.has(theme.id) || typeof document === 'undefined') return
  loaded.add(theme.id)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?${theme.fonts}&display=swap`
  document.head.appendChild(link)
}
