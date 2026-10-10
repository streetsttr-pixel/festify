import { Globe, LibraryBig, LogOut, Moon, PartyPopper, Plus, Settings, Sun } from 'lucide-react'
import { goAdmin, navigate } from '../hooks/useRoute'
import { repo, isDemo } from '../services/repository'
import { isNative } from '../lib/native'
import Logo from './Logo'

const TABS = [
  { id: 'invites', label: 'Convites', icon: PartyPopper, view: undefined },
  { id: 'library', label: 'Biblioteca', icon: LibraryBig, view: 'library' },
  { id: 'settings', label: 'Ajustes', icon: Settings, view: 'settings' },
]

export default function Header({ dark, onToggleDark, tab }) {
  const iconBtn =
    'grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'

  return (
    <>
      <header className="glass pt-safe sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
          <button onClick={() => goAdmin()} aria-label="Ir para o início do painel" className="flex items-center gap-2 rounded-xl">
            <Logo />
            {isDemo && <span className="chip hidden bg-amber-100 text-amber-800 sm:inline-flex">Modo demo</span>}
          </button>

          {/* Abas (desktop) */}
          <nav className="hidden items-center gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-white/5 md:flex">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => goAdmin({ view: t.view })}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  tab === t.id ? 'bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={() => navigate(isNative() ? { site: '1' } : {})} className={iconBtn} title="Ver site público" aria-label="Ver site público">
              <Globe className="h-5 w-5" />
            </button>
            <button onClick={onToggleDark} className={`${iconBtn} dark:text-amber-300`} aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'} title={dark ? 'Modo claro' : 'Modo escuro'}>
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={() => repo.signOut()} className={iconBtn} title="Sair" aria-label="Sair">
              <LogOut className="h-5 w-5" />
            </button>
            <button onClick={() => goAdmin({ view: 'new' })} className="btn-primary hidden h-10 px-4 sm:inline-flex">
              <Plus className="h-5 w-5" /> Criar Nova Festa
            </button>
          </div>
        </div>
      </header>

      {/* Abas (celular) — barra inferior estilo app */}
      <nav className="pb-safe glass fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 px-2 pt-1.5">
          {TABS.slice(0, 2).map((t) => (
            <TabButton key={t.id} t={t} active={tab === t.id} />
          ))}
          <button onClick={() => goAdmin({ view: 'new' })} className="flex flex-col items-center gap-0.5 py-1 text-[0.7rem] font-semibold text-brand-600 dark:text-brand-300">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-glow">
              <Plus className="h-5 w-5" />
            </span>
            Nova festa
          </button>
          <TabButton t={TABS[2]} active={tab === 'settings'} />
        </div>
      </nav>
    </>
  )
}

function TabButton({ t, active }) {
  return (
    <button
      onClick={() => goAdmin({ view: t.view })}
      className={`flex flex-col items-center gap-0.5 py-1 text-[0.7rem] font-semibold transition ${
        active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <span className={`grid h-8 w-12 place-items-center rounded-full transition ${active ? 'bg-brand-100 dark:bg-brand-500/20' : ''}`}>
        <t.icon className="h-5 w-5" />
      </span>
      {t.label}
    </button>
  )
}
