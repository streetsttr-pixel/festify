// ────────────────────────────────────────────────────────────
// Adapter local (MODO DEMONSTRAÇÃO) — dados no localStorage.
//
// Implementa exatamente o mesmo contrato do supabaseAdapter.js,
// então a interface não sabe (nem precisa saber) onde os dados estão.
// "Tempo real": eventos na mesma aba (EventTarget) e entre abas (storage).
// ────────────────────────────────────────────────────────────
import { uid } from '../lib/utils'

const NS = 'festify:v1'
const KEYS = {
  parties: `${NS}:parties`,
  themes: `${NS}:themes`,
  settings: `${NS}:settings`,
  admin: `${NS}:demo-admin`,
  rsvps: (partyId) => `${NS}:rsvps:${partyId}`,
}

const bus = new EventTarget()

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      throw new Error(
        'Armazenamento do modo demonstração cheio. Use fotos menores, exclua itens antigos ou conecte o Supabase.'
      )
    }
    throw err
  }
}

const emit = (type, id) => bus.dispatchEvent(new CustomEvent('change', { detail: { type, id, partyId: id } }))
const now = () => new Date().toISOString()
const byDate = (a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)

function upsert(key, input) {
  const list = read(key, [])
  const idx = list.findIndex((x) => x.id === input.id)
  let item
  if (idx >= 0) {
    item = { ...list[idx], ...input, updatedAt: now() }
    list[idx] = item
  } else {
    item = { ...input, id: input.id || uid(), createdAt: now(), updatedAt: now() }
    list.push(item)
  }
  write(key, list)
  return item
}

export function createLocalAdapter() {
  return {
    name: 'local',

    // ── Autenticação (demo: sem senha) ──
    async getSession() {
      return localStorage.getItem(KEYS.admin) ? { user: { email: 'demo@festify.app' } } : null
    },
    async signIn() {
      localStorage.setItem(KEYS.admin, '1')
      bus.dispatchEvent(new CustomEvent('auth'))
    },
    async signOut() {
      localStorage.removeItem(KEYS.admin)
      bus.dispatchEvent(new CustomEvent('auth'))
    },
    onAuthChange(cb) {
      const handler = async () => cb(await this.getSession())
      bus.addEventListener('auth', handler)
      return () => bus.removeEventListener('auth', handler)
    },

    // ── Imagens: no modo demo ficam como data URL ──
    async uploadImage(dataUrl) {
      return dataUrl
    },

    // ── Ajustes do buffet ──
    async getSettings() {
      return read(KEYS.settings, {})
    },
    async saveSettings(settings) {
      write(KEYS.settings, settings)
      emit('settings')
      return settings
    },

    // ── Biblioteca de temas ──
    async listThemes() {
      return read(KEYS.themes, []).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    },
    async getTheme(id) {
      return read(KEYS.themes, []).find((t) => t.id === id) || null
    },
    async getThemeBySlug(slug) {
      return read(KEYS.themes, []).find((t) => t.slug === slug) || null
    },
    async isThemeSlugAvailable(slug, ignoreId) {
      return !read(KEYS.themes, []).some((t) => t.slug === slug && t.id !== ignoreId)
    },
    async saveTheme(input) {
      const theme = upsert(KEYS.themes, input)
      emit('theme', theme.id)
      return theme
    },
    async deleteTheme(id) {
      write(
        KEYS.themes,
        read(KEYS.themes, []).filter((t) => t.id !== id)
      )
      emit('theme', id)
    },

    // ── Festas / convites ──
    async listParties() {
      return read(KEYS.parties, []).sort(byDate)
    },
    async getParty(id) {
      return read(KEYS.parties, []).find((p) => p.id === id) || null
    },
    async getPartyBySlug(slug) {
      const p = read(KEYS.parties, []).find((x) => x.slug === slug)
      if (!p) return null
      // eslint-disable-next-line no-unused-vars
      const { clientToken, ...pub } = p // o token da lista nunca vai para a página pública
      return pub
    },
    async isSlugAvailable(slug, ignoreId) {
      return !read(KEYS.parties, []).some((p) => p.slug === slug && p.id !== ignoreId)
    },
    async saveParty(input) {
      const party = upsert(KEYS.parties, { ...input, clientToken: input.clientToken || uid() })
      emit('party', party.id)
      return party
    },
    async deleteParty(id) {
      write(
        KEYS.parties,
        read(KEYS.parties, []).filter((p) => p.id !== id)
      )
      localStorage.removeItem(KEYS.rsvps(id))
      emit('party', id)
    },

    // ── Confirmações (RSVP) ──
    async listRsvps(partyId) {
      return read(KEYS.rsvps(partyId), []).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
    async addRsvp(partyId, data) {
      const list = read(KEYS.rsvps(partyId), [])
      const rsvp = {
        id: uid(),
        partyId,
        name: String(data.name || '').trim(),
        adults: Math.max(0, Number(data.adults) || 0),
        children: Math.max(0, Number(data.children) || 0),
        message: String(data.message || '').trim(),
        createdAt: now(),
      }
      list.push(rsvp)
      write(KEYS.rsvps(partyId), list)
      emit('rsvp', partyId)
      return rsvp
    },
    async deleteRsvp(partyId, rsvpId) {
      write(
        KEYS.rsvps(partyId),
        read(KEYS.rsvps(partyId), []).filter((r) => r.id !== rsvpId)
      )
      emit('rsvp', partyId)
    },

    /** Lista privada do cliente (link com token) */
    async getClientList(token) {
      const party = read(KEYS.parties, []).find((p) => p.clientToken === token)
      if (!party) return null
      return { party, rsvps: await this.listRsvps(party.id) }
    },

    /** Inscreve-se em mudanças. Retorna função de cancelamento. */
    subscribe(callback) {
      const onLocal = (e) => callback(e.detail)
      const onStorage = (e) => {
        if (!e.key || !e.key.startsWith(NS)) return
        if (e.key.startsWith(`${NS}:rsvps:`)) return callback({ type: 'rsvp', partyId: e.key.split(':').pop(), remote: true })
        const type = e.key.endsWith(':themes') ? 'theme' : e.key.endsWith(':settings') ? 'settings' : 'party'
        callback({ type, remote: true })
      }
      bus.addEventListener('change', onLocal)
      window.addEventListener('storage', onStorage)
      return () => {
        bus.removeEventListener('change', onLocal)
        window.removeEventListener('storage', onStorage)
      }
    },
  }
}
