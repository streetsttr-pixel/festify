// ────────────────────────────────────────────────────────────
// Adapter Supabase — dados online compartilhados entre admin,
// clientes e convidados. Mesmo contrato do localAdapter.
//
// Tabelas, funções e permissões: supabase/schema.sql
//   settings  → ajustes do buffet (leitura pública)
//   themes    → biblioteca de temas (leitura pública)
//   parties   → convites (só admin; público lê via função public_party)
//   rsvps     → confirmações (público só insere; admin lê/apaga;
//               cliente lê via função client_list com o token)
//   storage   → bucket público "festify" (fotos)
// ────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'
import { uid } from '../lib/utils'

const BUCKET = 'festify'

export function createSupabaseAdapter({ url, anonKey }) {
  const sb = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'festify-auth' },
  })

  const bus = new EventTarget()
  const emit = (type, id) => bus.dispatchEvent(new CustomEvent('change', { detail: { type, id, partyId: id } }))

  const must = ({ data, error }) => {
    if (error) throw new Error(translateError(error))
    return data
  }

  const toParty = (row) =>
    row && {
      ...row.data,
      id: row.id,
      slug: row.slug,
      clientToken: row.client_token,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  const toTheme = (row) => row && { ...row.data, id: row.id, slug: row.slug, createdAt: row.created_at, updatedAt: row.updated_at }
  const toRsvp = (r) => ({
    id: r.id,
    partyId: r.party_id,
    name: r.name,
    adults: r.adults,
    children: r.children,
    message: r.message || '',
    createdAt: r.created_at,
  })

  // Realtime: um único canal para o app inteiro, repassado pelo bus
  let channel = null
  function ensureRealtime() {
    if (channel) return
    channel = sb
      .channel('festify-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, (p) =>
        emit('rsvp', p.new?.party_id || p.old?.party_id)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parties' }, () => emit('party'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'themes' }, () => emit('theme'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => emit('settings'))
      .subscribe()
  }

  async function uploadDataUrl(dataUrl, folder) {
    const blob = await (await fetch(dataUrl)).blob()
    const ext = blob.type === 'image/png' ? 'png' : 'jpg'
    const path = `${folder}/${uid()}.${ext}`
    must(await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false }))
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  async function removeImages(urls = []) {
    const marker = `/object/public/${BUCKET}/`
    const paths = urls.filter((u) => typeof u === 'string' && u.includes(marker)).map((u) => decodeURIComponent(u.split(marker)[1]))
    if (paths.length) await sb.storage.from(BUCKET).remove(paths).catch(() => {})
  }

  return {
    name: 'supabase',
    client: sb,

    // ── Autenticação ──
    async getSession() {
      return (await sb.auth.getSession()).data.session
    },
    async signIn(email, password) {
      must(await sb.auth.signInWithPassword({ email: email.trim(), password }))
    },
    async signOut() {
      await sb.auth.signOut()
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session))
      return () => data.subscription.unsubscribe()
    },

    // ── Imagens ──
    async uploadImage(dataUrl, folder = 'misc') {
      if (!dataUrl?.startsWith('data:')) return dataUrl
      return uploadDataUrl(dataUrl, folder)
    },

    // ── Ajustes ──
    async getSettings() {
      const row = must(await sb.from('settings').select('data').eq('id', 1).maybeSingle())
      return row?.data || {}
    },
    async saveSettings(settings) {
      must(await sb.from('settings').upsert({ id: 1, data: settings, updated_at: new Date().toISOString() }))
      emit('settings')
      return settings
    },

    // ── Temas ──
    async listThemes() {
      const rows = must(await sb.from('themes').select('*'))
      return rows.map(toTheme).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'))
    },
    async getTheme(id) {
      return toTheme(must(await sb.from('themes').select('*').eq('id', id).maybeSingle()))
    },
    async getThemeBySlug(slug) {
      return toTheme(must(await sb.from('themes').select('*').eq('slug', slug).maybeSingle()))
    },
    async isThemeSlugAvailable(slug, ignoreId) {
      const rows = must(await sb.from('themes').select('id').eq('slug', slug))
      return !rows.some((r) => r.id !== ignoreId)
    },
    async saveTheme(input) {
      // eslint-disable-next-line no-unused-vars
      const { id, slug, createdAt, updatedAt, ...data } = input
      data.photos = await Promise.all((data.photos || []).map((p) => this.uploadImage(p, 'themes')))
      const row = must(
        await sb
          .from('themes')
          .upsert({ id: id || uid(), slug, data, updated_at: new Date().toISOString() })
          .select()
          .single()
      )
      emit('theme', row.id)
      return toTheme(row)
    },
    async deleteTheme(id) {
      const theme = await this.getTheme(id)
      must(await sb.from('themes').delete().eq('id', id))
      // Não apaga fotos que ainda são capa de algum convite já criado
      const used = new Set((await this.listParties()).map((p) => p.coverImage))
      await removeImages((theme?.photos || []).filter((u) => !used.has(u)))
      emit('theme', id)
    },

    // ── Festas / convites ──
    async listParties() {
      const rows = must(await sb.from('parties').select('*'))
      return rows.map(toParty).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    },
    async getParty(id) {
      return toParty(must(await sb.from('parties').select('*').eq('id', id).maybeSingle()))
    },
    async getPartyBySlug(slug) {
      // Função pública que NÃO expõe o token da lista do cliente
      const row = must(await sb.rpc('public_party', { p_slug: slug }))
      return row ? toParty(row) : null
    },
    async isSlugAvailable(slug, ignoreId) {
      const rows = must(await sb.from('parties').select('id').eq('slug', slug))
      return !rows.some((r) => r.id !== ignoreId)
    },
    async saveParty(input) {
      // eslint-disable-next-line no-unused-vars
      const { id, slug, clientToken, createdAt, updatedAt, ...data } = input
      // Foto enviada do celular: vai só para a pasta do convite (não entra na biblioteca)
      if (data.coverImage?.startsWith('data:')) data.coverImage = await uploadDataUrl(data.coverImage, 'invites')
      const row = must(
        await sb
          .from('parties')
          .upsert({
            id: id || uid(),
            slug,
            client_token: clientToken || uid(),
            data,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()
      )
      emit('party', row.id)
      return toParty(row)
    },
    async deleteParty(id) {
      const party = await this.getParty(id)
      must(await sb.from('parties').delete().eq('id', id))
      if (party?.coverImage?.includes('/invites/')) await removeImages([party.coverImage])
      emit('party', id)
    },

    // ── Confirmações ──
    async listRsvps(partyId) {
      const rows = must(await sb.from('rsvps').select('*').eq('party_id', partyId).order('created_at', { ascending: false }))
      return rows.map(toRsvp)
    },
    async addRsvp(partyId, data) {
      // Convidado anônimo só pode INSERIR (não lê a tabela), então o id é gerado aqui
      const row = {
        id: uid(),
        party_id: partyId,
        name: String(data.name || '').trim(),
        adults: Math.max(0, Number(data.adults) || 0),
        children: Math.max(0, Number(data.children) || 0),
        message: String(data.message || '').trim(),
      }
      must(await sb.from('rsvps').insert(row))
      emit('rsvp', partyId)
      return toRsvp({ ...row, created_at: new Date().toISOString() })
    },
    async deleteRsvp(partyId, rsvpId) {
      must(await sb.from('rsvps').delete().eq('id', rsvpId))
      emit('rsvp', partyId)
    },
    async getClientList(token) {
      const res = must(await sb.rpc('client_list', { p_token: token }))
      if (!res) return null
      return { party: toParty(res.party), rsvps: (res.rsvps || []).map(toRsvp) }
    },

    subscribe(callback) {
      ensureRealtime()
      const onLocal = (e) => callback(e.detail)
      bus.addEventListener('change', onLocal)
      // Plano B caso o realtime esteja desligado: atualiza a cada 20 s com a aba visível
      const timer = setInterval(() => {
        if (document.visibilityState === 'visible') callback({ type: 'poll', remote: true })
      }, 20000)
      return () => {
        bus.removeEventListener('change', onLocal)
        clearInterval(timer)
      }
    },
  }
}

function translateError(error) {
  const msg = error?.message || String(error)
  if (/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.'
  if (/Email not confirmed/i.test(msg)) return 'E-mail ainda não confirmado no Supabase.'
  if (/row-level security|permission denied/i.test(msg)) return 'Sem permissão. Entre como administrador.'
  if (/duplicate key/i.test(msg)) return 'Já existe um item com esse link. Escolha outro.'
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'Sem conexão com o servidor. Verifique a internet.'
  return msg
}
