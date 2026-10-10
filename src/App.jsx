import { lazy, Suspense } from 'react'
import { useRoute } from './hooks/useRoute'
import { ToastProvider } from './components/ui/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import { isNative } from './lib/native'

// Code-splitting: cada visitante baixa só o que precisa
const HostApp = lazy(() => import('./host/HostApp'))
const GuestView = lazy(() => import('./guest/GuestView'))
const LibraryView = lazy(() => import('./library/LibraryView'))
const ThemePage = lazy(() => import('./library/ThemePage'))
const ThemeDemo = lazy(() => import('./library/ThemeDemo'))
const ClientListView = lazy(() => import('./client/ClientListView'))

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
    </div>
  )
}

function Router({ route }) {
  if (route.festa) return <GuestView key={route.festa} slug={route.festa} preview={route.preview === '1'} />
  if (route.lista) return <ClientListView token={route.lista} />
  if (route.tema && route.demo) return <ThemeDemo key={route.tema} slug={route.tema} />
  if (route.tema) return <ThemePage key={route.tema} slug={route.tema} />
  if (route.admin || route.view || (isNative() && !route.site)) return <HostApp route={route} />
  return <LibraryView />
}

export default function App() {
  const route = useRoute()
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Suspense fallback={<Splash />}>
          <Router route={route} />
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  )
}
