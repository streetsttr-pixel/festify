import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import { useAuth } from '../hooks/useData'
import Header from './Header'
import Login from './Login'
import Dashboard from './Dashboard'
import PartyForm from './PartyForm'
import RsvpManager from './RsvpManager'
import ThemesAdmin from './ThemesAdmin'
import ThemeEditor from './ThemeEditor'
import SettingsAdmin from './SettingsAdmin'

export default function HostApp({ route }) {
  const [dark, toggleDark] = useDarkMode()
  const { isAdmin, loading } = useAuth()

  useEffect(() => {
    document.title = 'Festify — Painel do Buffet'
  }, [])

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }
  if (!isAdmin) return <Login />

  let page
  switch (route.view) {
    case 'new':
      page = <PartyForm key={`new-${route.theme || ''}`} themeId={route.theme} />
      break
    case 'edit':
      page = <PartyForm key={route.id} partyId={route.id} />
      break
    case 'guests':
      page = <RsvpManager partyId={route.id} />
      break
    case 'library':
      page = <ThemesAdmin />
      break
    case 'theme':
      page = <ThemeEditor key={route.id} themeId={route.id === 'new' ? null : route.id} />
      break
    case 'settings':
      page = <SettingsAdmin />
      break
    default:
      page = <Dashboard />
  }

  const tab = ['library', 'theme'].includes(route.view) ? 'library' : route.view === 'settings' ? 'settings' : 'invites'

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,rgba(196,46,245,0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(196,46,245,0.14),transparent_60%)]">
      <Header dark={dark} onToggleDark={toggleDark} tab={tab} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-24">{page}</main>
    </div>
  )
}
