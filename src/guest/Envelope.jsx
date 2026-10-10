import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { MailOpen } from 'lucide-react'
import { formatDateShort } from '../lib/utils'
import ThemeDecor from './ThemeDecor'

/**
 * Envelope digital selado. Ao abrir:
 * selo rompe → aba gira em 3D → carta sobe → carta "vem" até a tela
 * (efeito de profundidade) enquanto o convite é revelado por trás.
 */
export default function Envelope({ party, theme, onReveal, onDone }) {
  const root = useRef()
  const [opening, setOpening] = useState(false)
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // Entrada: envelope flutua para a tela
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.js-env', { y: 60, rotate: -4, opacity: 0, duration: 0.9, ease: 'back.out(1.4)' })
      gsap.from('.js-intro', { y: 16, opacity: 0, duration: 0.6, stagger: 0.1, delay: 0.25, ease: 'power2.out' })
      gsap.to('.js-env', { y: -8, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.9 })
    }, root)
    return () => ctx.revert()
  }, [])

  const open = () => {
    if (opening) return
    setOpening(true)

    if (reduceMotion) {
      onReveal()
      gsap.to(root.current, { opacity: 0, duration: 0.3, onComplete: onDone })
      return
    }

    const q = gsap.utils.selector(root)
    gsap.killTweensOf(q('.js-env'))
    gsap.set(q('.env-flap'), { transformPerspective: 900 })
    const tl = gsap.timeline({ onComplete: onDone })

    tl.to(q('.js-intro'), { opacity: 0, y: -12, duration: 0.3, stagger: 0.05, ease: 'power1.in' })
      .to(q('.js-env'), { y: 0, rotate: 0, scale: 1.04, duration: 0.35, ease: 'power2.out' }, 0)
      // 1. Selo rompe
      .to(q('.env-seal'), { scale: 1.25, duration: 0.14, ease: 'power1.out' }, 0.1)
      .to(q('.env-seal'), { scale: 0, rotate: -140, opacity: 0, duration: 0.38, ease: 'back.in(2.2)' })
      // 2. Aba abre em 3D
      .to(q('.env-flap'), { rotateX: 180, duration: 0.65, ease: 'power2.inOut' }, '-=0.08')
      .set(q('.env-flap'), { zIndex: 1 }, '-=0.32')
      // 3. Carta desliza para fora
      .to(q('.env-letter'), { yPercent: -58, duration: 0.75, ease: 'power3.out' }, '-=0.12')
      // 4. Carta avança até a tela (profundidade) e o envelope cai
      .set(q('.env-letter'), { zIndex: 6 })
      .add(onReveal, '+=0.05')
      .to(q('.env-letter'), { scale: 3.4, yPercent: -20, opacity: 0, duration: 0.85, ease: 'power2.in' }, '<')
      .to(q('.env-body, .env-flap'), { y: 160, rotate: 6, opacity: 0, duration: 0.6, ease: 'power2.in' }, '<')
      .to(root.current, { opacity: 0, duration: 0.45, ease: 'power1.out' }, '-=0.35')
  }

  return (
    <div
      ref={root}
      className={`${theme.className} g-root fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-4 pb-safe pt-safe`}
      style={{ pointerEvents: opening ? 'none' : 'auto' }}
    >
      <ThemeDecor theme={theme.id} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="js-intro g-eyebrow">Você recebeu um convite</p>
        <h1 className="js-intro g-heading mt-2 max-w-xs text-xl leading-snug">{theme.emoji} Abra para descobrir</h1>

        <div className="env-scene mt-10">
          <button type="button" onClick={open} className="js-env env block" aria-label="Abrir convite">
            <div className="env-body absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
              <div className="env-back" />
            </div>
            <div className="env-letter">
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] opacity-60">Convite</span>
              <span className="mt-2 line-clamp-2 text-[0.95rem] font-bold leading-tight" style={{ fontFamily: 'var(--g-font-heading)' }}>
                {party.title}
              </span>
              <span className="mt-1.5 text-[0.7rem] opacity-60">{formatDateShort(party)}</span>
            </div>
            <div className="env-body env-pocket" />
            <div className="env-flap">
              <div className="env-flap-face" />
            </div>
            <div className="env-seal" aria-hidden>
              {theme.seal}
            </div>
          </button>
        </div>

        <p className="js-intro g-muted mt-8 text-sm">
          Para: <span className="font-semibold" style={{ color: 'var(--g-text)' }}>Você 💌</span>
        </p>

        <button type="button" onClick={open} className="js-intro g-btn g-btn-primary pulse-cta mt-5 w-64 max-w-full">
          <MailOpen className="h-5 w-5" /> Abrir Convite
        </button>
      </div>
    </div>
  )
}
