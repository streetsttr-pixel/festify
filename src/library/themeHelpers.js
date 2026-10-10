// Utilitários da biblioteca de temas (público + admin)
import { GENDERS, searchKey, themePageUrl, whatsappLink } from '../lib/utils'
import { navigate } from '../hooks/useRoute'
import { isNative } from '../lib/native'

export const themeCover = (t) => t?.photos?.[t.coverIndex || 0] || t?.photos?.[0] || ''

export const genderOf = (t) => GENDERS[t?.gender] || GENDERS.unissex

/** Filtro por gênero: temas "para todos" aparecem tanto em menina quanto em menino */
export const matchesGender = (t, filter) => !filter || filter === 'todos' || t.gender === filter || t.gender === 'unissex'

export function matchesSearch(t, query) {
  const q = searchKey(query)
  if (!q) return true
  const haystack = searchKey([t.name, t.description, ...(t.tags || [])].join(' '))
  return q.split(/\s+/).every((word) => haystack.includes(word))
}

/** Volta para a página inicial da biblioteca (no APK a home é o painel) */
export const goLibrary = (opts) => navigate(isNative() ? { site: '1' } : {}, opts)

const isoInDays = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Festa fictícia para miniatura e demonstração do convite do tema */
export function sampleParty(theme, settings = {}) {
  const title =
    theme.gender === 'menina' ? 'Aniversário de 5 Anos da Alice' : theme.gender === 'menino' ? 'Aniversário de 5 Anos do Theo' : 'Aniversário de 5 Anos'
  return {
    id: `demo-${theme.id}`,
    slug: `demo-${theme.slug}`,
    title,
    message: `Prepare-se para uma festa incrível com o tema ${theme.name}! Esperamos você.`,
    date: isoInDays(30),
    time: '15:00',
    coverImage: themeCover(theme),
    theme: theme.style || 'kids',
    venueName: settings.buffetName || 'Nosso buffet',
    address: settings.address || 'Endereço do buffet',
    mapsUrl: settings.mapsUrl || '',
    pixEnabled: false,
  }
}

/** Link do WhatsApp do buffet com a mensagem "Amei esse tema..." */
export function requestInviteLink(theme, settings) {
  const text = `Amei esse tema: *${theme.name}*, vou querer ele!! 🎉\nConsegue me enviar o link do convite online?\n\n${themePageUrl(theme.slug)}`
  return whatsappLink(settings.whatsapp, text)
}
