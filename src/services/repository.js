// ────────────────────────────────────────────────────────────
// Ponto único de acesso a dados. A interface importa apenas `repo`.
//
// Sem configuração → modo demonstração (localStorage).
// Com supabaseUrl + supabaseKey em public/config.js → Supabase.
//
// Contrato (todos assíncronos):
//   auth:     getSession · signIn(email, senha) · signOut · onAuthChange(cb)
//   imagens:  uploadImage(dataUrl, pasta) → url
//   ajustes:  getSettings · saveSettings
//   temas:    listThemes · getTheme · getThemeBySlug · isThemeSlugAvailable · saveTheme · deleteTheme
//   festas:   listParties · getParty · getPartyBySlug · isSlugAvailable · saveParty · deleteParty
//   rsvps:    listRsvps · addRsvp · deleteRsvp · getClientList(token)
//   tempo real: subscribe(cb) → unsubscribe
// ────────────────────────────────────────────────────────────
import { CONFIG, isCloud } from '../lib/config'
import { createLocalAdapter } from './localAdapter'
import { createSupabaseAdapter } from './supabaseAdapter'
import { seedDemoData } from './seed'

export const repo = isCloud()
  ? createSupabaseAdapter({ url: CONFIG.supabaseUrl, anonKey: CONFIG.supabaseKey })
  : createLocalAdapter()

export const isDemo = repo.name === 'local'

/** Resolve quando os dados de demonstração estiverem prontos (no-op no Supabase) */
export const ready = isDemo ? seedDemoData(repo) : Promise.resolve()
