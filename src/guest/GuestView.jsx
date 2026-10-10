import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, CalendarDays, Clock, Eye, Gift, MapPin, Navigation } from 'lucide-react'
import { useParty, useSettings } from '../hooks/useData'
import { goAdmin } from '../hooks/useRoute'
import { getTheme, loadThemeFonts } from '../lib/themes'
import { formatDateLong, formatTime, mapsHref, partyDate, wazeHref } from '../lib/utils'
import Envelope from './Envelope'
import Countdown from './Countdown'
import PixModal from './PixModal'
import RsvpForm from './RsvpForm'
import ThemeDecor from './ThemeDecor'

gsap.registerPlugin(ScrollTrigger)

const THEME_COLOR = { kids: '#fff8ef', wedding: '#f7f1ea', neon: '#07040f', minimal: '#f7f5f0' }

export default function GuestView({ slug, preview }) {
  const { party, loading } = useParty({ slug })

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
      </div>
    )
  }
  if (!party) return <NotFound />
  return (
    <GuestInvite
      party={party}
      preview={preview}
      banner={preview ? { label: 'Modo visualização', backLabel: 'Voltar ao painel', onBack: () => goAdmin() } : null}
    />
  )
}

/**
 * Convite completo (envelope + conteúdo). Usado pelo convite real e pela
 * demonstração dos temas da biblioteca.
 *   preview → RSVP não é salvo
 *   banner  → { label, backLabel, onBack } faixa superior opcional
 */
export function GuestInvite({ party, preview, banner }) {
  const { settings } = useSettings()
  const [envelope, setEnvelope] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const [pixOpen, setPixOpen] = useState(false)
  const contentRef = useRef()
  const theme = getTheme(party?.theme)

  // Ambiente da página do convidado: sem dark mode do painel, fontes e cor da barra do tema
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    loadThemeFonts(theme.id)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme.id])
    if (party) document.title = `${party.title} · Convite`
  }, [theme.id, party])

  // Trava o scroll enquanto o envelope está fechado
  useEffect(() => {
    document.body.style.overflow = envelope && party ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [envelope, party])

  // Revelação do conteúdo (profundidade + stagger) e seções no scroll
  useLayoutEffect(() => {
    if (!revealed || !contentRef.current) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(contentRef.current, { opacity: 1 })
        return
      }
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.92, filter: 'blur(10px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', clearProps: 'filter,scale' }
      )
      gsap.from('[data-reveal]', { y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.15 })

      gsap.set('[data-reveal-scroll]', { opacity: 0, y: 48 })
      ScrollTrigger.batch('[data-reveal-scroll]', {
        start: 'top 92%',
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.75, stagger: 0.12, ease: 'power3.out', overwrite: true }),
      })
      ScrollTrigger.refresh()
    }, contentRef)
    return () => ctx.revert()
  }, [revealed])

  const date = partyDate(party)
  const hasPix = party.pixEnabled && party.pixKey

  return (
    <div className={`${theme.className} g-root relative overflow-x-hidden`}>
      <ThemeDecor theme={theme.id} />

      {banner && (
        <div className="sticky top-0 z-40 flex items-center justify-between gap-2 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white backdrop-blur pt-safe" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> {banner.label}
          </span>
          <button onClick={banner.onBack} className="flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 hover:bg-white/25">
            <ArrowLeft className="h-3.5 w-3.5" /> {banner.backLabel}
          </button>
        </div>
      )}

      <main ref={contentRef} className="relative z-10 mx-auto w-full max-w-md space-y-5 px-4 pb-10 pt-6" style={{ opacity: revealed ? undefined : 0 }}>
        {/* ── Card do evento ── */}
        <article data-reveal className="g-card overflow-hidden">
          <div className="relative aspect-[4/3] overflow-hidden" style={{ borderRadius: 'calc(var(--g-radius) - 1px) calc(var(--g-radius) - 1px) 0 0' }}>
            {party.coverImage ? (
              <img src={party.coverImage} alt={party.title} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-7xl" style={{ background: 'var(--g-hero)' }}>
                <span className="float-y drop-shadow-lg">{theme.emoji}</span>
              </div>
            )}
          </div>
          <div className="px-5 pb-6 pt-5 text-center">
            <p className="g-eyebrow">{theme.invitedLabel}</p>
            <h1 className="g-title mt-2">{party.title}</h1>
            {party.message && <p className="g-muted mx-auto mt-3 max-w-sm text-[0.98rem] leading-relaxed">{party.message}</p>}

            <div className="mt-5 grid grid-cols-2 gap-2.5 text-left">
              <div className="g-soft rounded-2xl p-3">
                <p className="g-muted flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                  <CalendarDays className="h-4 w-4" /> Data
                </p>
                <p className="g-heading mt-1 leading-snug">{formatDateLong(party).replace(/ de \d{4}$/, '')}</p>
              </div>
              <div className="g-soft rounded-2xl p-3">
                <p className="g-muted flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                  <Clock className="h-4 w-4" /> Horário
                </p>
                <p className="g-heading mt-1 text-2xl leading-none">{formatTime(party)}</p>
              </div>
            </div>
          </div>
        </article>

        {/* ── Contador ── */}
        <div data-reveal>{date && <Countdown target={date} />}</div>

        {/* ── Local + Ações diretas ── */}
        <section data-reveal-scroll className="g-card p-5">
          <div className="flex items-start gap-3">
            <span className="g-soft grid h-11 w-11 shrink-0 place-items-center rounded-full">
              <MapPin className="h-5 w-5 g-accent" />
            </span>
            <div className="min-w-0">
              <p className="g-eyebrow">Local</p>
              <p className="g-heading mt-0.5 text-lg leading-snug">{party.venueName}</p>
              <p className="g-muted mt-0.5 text-sm leading-relaxed">{party.address}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-2.5">
            <a href={mapsHref(party)} target="_blank" rel="noopener noreferrer" className="g-btn g-btn-primary">
              <Navigation className="h-5 w-5" /> Como Chegar
            </a>
            {hasPix && (
              <button onClick={() => setPixOpen(true)} className="g-btn g-btn-outline">
                <Gift className="h-5 w-5" /> Presentear via Pix
              </button>
            )}
          </div>
          {wazeHref(party) && (
            <a href={wazeHref(party)} target="_blank" rel="noopener noreferrer" className="g-muted mt-3 block text-center text-sm font-semibold underline-offset-4 hover:underline">
              Prefere o Waze? Abrir no Waze →
            </a>
          )}
        </section>

        {/* ── RSVP ── */}
        <div data-reveal-scroll>
          <RsvpForm party={party} theme={theme} preview={preview} />
        </div>

        <footer className="g-muted pb-safe pt-4 text-center text-xs leading-relaxed">
          Convite digital {settings.buffetName ? <>por <b style={{ color: 'var(--g-text)' }}>{settings.buffetName}</b></> : 'criado com Festify ✨'}
          <br />
          <a href="./" className="font-bold underline-offset-4 hover:underline" style={{ color: 'var(--g-text)' }}>
            Conheça nossos temas de festa →
          </a>
        </footer>
      </main>

      {hasPix && <PixModal open={pixOpen} onClose={() => setPixOpen(false)} party={party} theme={theme} />}

      {envelope && <Envelope party={party} theme={theme} onReveal={() => setRevealed(true)} onDone={() => setEnvelope(false)} />}
    </div>
  )
}

function NotFound() {
  return (
    <div className="theme-minimal g-root grid place-items-center px-6 text-center">
      <div className="g-card max-w-sm p-8">
        <div className="text-5xl">🔍</div>
        <h1 className="g-heading mt-4 text-2xl">Convite não encontrado</h1>
        <p className="g-muted mt-2 text-sm leading-relaxed">
          O link pode estar incorreto ou a festa foi removida pelo anfitrião. Confira o link recebido e tente novamente.
        </p>
        <a href="./" className="g-btn g-btn-primary mt-6 w-full">
          Ir para o Festify
        </a>
      </div>
    </div>
  )
}
