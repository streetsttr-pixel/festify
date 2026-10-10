// Hooks de dados — reagem em tempo real às mudanças do repositório
import { useCallback, useEffect, useState } from 'react'
import { repo } from '../services/repository'
import { sumRsvps } from '../lib/utils'

/** Lista de festas + totais de RSVP de cada uma (para o dashboard) */
export function useParties() {
  const [state, setState] = useState({ parties: [], stats: {}, loading: true, error: null })

  const load = useCallback(async () => {
    try {
      const parties = await repo.listParties()
      const entries = await Promise.all(
        parties.map(async (p) => [p.id, sumRsvps(await repo.listRsvps(p.id))])
      )
      setState({ parties, stats: Object.fromEntries(entries), loading: false, error: null })
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }))
    }
  }, [])

  useEffect(() => {
    load()
    return repo.subscribe(() => load())
  }, [load])

  return { ...state, reload: load }
}

/** Uma festa por id ou slug */
export function useParty({ id, slug }) {
  const [state, setState] = useState({ party: null, loading: true, error: null })

  const load = useCallback(async () => {
    try {
      const party = id ? await repo.getParty(id) : await repo.getPartyBySlug(slug)
      setState({ party, loading: false, error: null })
    } catch (error) {
      setState({ party: null, loading: false, error })
    }
  }, [id, slug])

  useEffect(() => {
    load()
    return repo.subscribe((e) => e.type !== 'rsvp' && load())
  }, [load])

  return state
}

/** RSVPs de uma festa, com totais e detecção de novas entradas (tempo real) */
export function useRsvps(partyId) {
  const [state, setState] = useState({ rsvps: [], loading: true, freshIds: new Set() })

  const load = useCallback(async () => {
    if (!partyId) return
    const rsvps = await repo.listRsvps(partyId)
    setState((prev) => {
      const known = new Set(prev.rsvps.map((r) => r.id))
      const freshIds = prev.loading ? new Set() : new Set(rsvps.filter((r) => !known.has(r.id)).map((r) => r.id))
      return { rsvps, loading: false, freshIds }
    })
  }, [partyId])

  useEffect(() => {
    load()
    return repo.subscribe((e) => (!e.partyId || e.partyId === partyId) && load())
  }, [load, partyId])

  return { ...state, totals: sumRsvps(state.rsvps), reload: load }
}

/** Ajustes do buffet (nome, WhatsApp, endereço...) */
export function useSettings() {
  const [state, setState] = useState({ settings: {}, loading: true })
  const load = useCallback(async () => {
    try {
      setState({ settings: await repo.getSettings(), loading: false })
    } catch {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [])
  useEffect(() => {
    load()
    return repo.subscribe((e) => (e.type === 'settings' || e.type === 'poll') && load())
  }, [load])
  return state
}

/** Biblioteca de temas */
export function useThemes() {
  const [state, setState] = useState({ themes: [], loading: true, error: null })
  const load = useCallback(async () => {
    try {
      setState({ themes: await repo.listThemes(), loading: false, error: null })
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }))
    }
  }, [])
  useEffect(() => {
    load()
    return repo.subscribe((e) => (e.type === 'theme' || e.type === 'poll') && load())
  }, [load])
  return state
}

/** Um tema por id ou slug */
export function useThemeRecord({ id, slug }) {
  const [state, setState] = useState({ theme: null, loading: true })
  const load = useCallback(async () => {
    if (!id && !slug) return setState({ theme: null, loading: false })
    try {
      const theme = id ? await repo.getTheme(id) : await repo.getThemeBySlug(slug)
      setState({ theme, loading: false })
    } catch {
      setState({ theme: null, loading: false })
    }
  }, [id, slug])
  useEffect(() => {
    load()
    return repo.subscribe((e) => e.type === 'theme' && load())
  }, [load])
  return state
}

/** Sessão do administrador */
export function useAuth() {
  const [state, setState] = useState({ session: null, loading: true })
  useEffect(() => {
    let alive = true
    repo.getSession().then((session) => alive && setState({ session, loading: false }))
    const off = repo.onAuthChange((session) => alive && setState({ session, loading: false }))
    return () => {
      alive = false
      off()
    }
  }, [])
  return { ...state, isAdmin: Boolean(state.session) }
}

/** Lista privada do cliente (link com token) — atualiza sozinha */
export function useClientList(token) {
  const [state, setState] = useState({ data: null, loading: true })
  const load = useCallback(async () => {
    try {
      setState({ data: await repo.getClientList(token), loading: false })
    } catch {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [token])
  useEffect(() => {
    load()
    const off = repo.subscribe(() => load())
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 15000)
    return () => {
      off()
      clearInterval(t)
    }
  }, [load])
  return state
}
