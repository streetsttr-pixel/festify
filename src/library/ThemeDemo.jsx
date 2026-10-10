import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useSettings, useThemeRecord } from '../hooks/useData'
import { canGoBack, navigate } from '../hooks/useRoute'
import { GuestInvite } from '../guest/GuestView'
import { sampleParty } from './themeHelpers'

/** Demonstração completa (envelope animado + convite) de um tema da biblioteca */
export default function ThemeDemo({ slug }) {
  const { theme, loading } = useThemeRecord({ slug })
  const { settings, loading: loadingSettings } = useSettings()

  useEffect(() => {
    if (!loading && !theme) navigate({ tema: slug }, { replace: true })
  }, [loading, theme, slug])

  if (loading || loadingSettings) {
    return (
      <div className="grid min-h-dvh place-items-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }
  if (!theme) return null

  return (
    <GuestInvite
      key={theme.id}
      party={sampleParty(theme, settings)}
      preview
      banner={{
        label: `Demonstração · ${theme.name}`,
        backLabel: 'Voltar ao tema',
        onBack: () => (canGoBack() ? window.history.back() : navigate({ tema: slug }, { replace: true })),
      }}
    />
  )
}
