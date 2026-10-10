import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'
import { Baby, Loader2, Minus, PartyPopper, Plus, User } from 'lucide-react'
import { repo } from '../services/repository'

const MINE_KEY = (partyId) => `festify:guest:${partyId}`

function Stepper({ label, sub, icon: Icon, value, onChange, min = 0, max = 20 }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="g-soft grid h-10 w-10 shrink-0 place-items-center rounded-full">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="g-heading leading-tight">{label}</p>
          <p className="g-muted text-xs">{sub}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <button type="button" className="g-step-btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Diminuir ${label}`}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="g-count-num w-7 text-center text-xl font-bold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button type="button" className="g-step-btn plus" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Aumentar ${label}`}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function fireConfetti(colors) {
  const opts = { colors, disableForReducedMotion: true, zIndex: 80 }
  confetti({ ...opts, particleCount: 120, spread: 80, startVelocity: 45, origin: { y: 0.7 } })
  const end = Date.now() + 1400
  ;(function frame() {
    confetti({ ...opts, particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } })
    confetti({ ...opts, particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

export default function RsvpForm({ party, theme, preview }) {
  const [name, setName] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [confirmed, setConfirmed] = useState(() => {
    if (preview) return null
    try {
      return JSON.parse(localStorage.getItem(MINE_KEY(party.id)))
    } catch {
      return null
    }
  })
  const formRef = useRef()
  const successRef = useRef()
  const justConfirmed = useRef(false)

  useLayoutEffect(() => {
    if (confirmed && justConfirmed.current && successRef.current) {
      justConfirmed.current = false
      gsap.fromTo(
        successRef.current,
        { opacity: 0, scale: 0.85, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' }
      )
      gsap.from(successRef.current.querySelectorAll('[data-pop]'), { opacity: 0, y: 12, stagger: 0.1, delay: 0.25, duration: 0.5 })
    }
  }, [confirmed])

  useEffect(() => setError(''), [name, adults, children])

  const submit = async (e) => {
    e.preventDefault()
    if (name.trim().length < 3) return setError('Digite seu nome completo 🙂')
    if (adults + children < 1) return setError('Informe pelo menos 1 pessoa')

    setSending(true)
    try {
      const data = { name: name.trim(), adults, children, message: message.trim() }
      const rsvp = preview ? { ...data, createdAt: new Date().toISOString() } : await repo.addRsvp(party.id, data)
      if (!preview) localStorage.setItem(MINE_KEY(party.id), JSON.stringify(rsvp))

      // Esconde o formulário com animação, depois mostra o sucesso
      await gsap.to(formRef.current, { opacity: 0, y: -16, scale: 0.97, duration: 0.35, ease: 'power2.in' })
      justConfirmed.current = true
      setConfirmed(rsvp)
      fireConfetti(theme.confetti)
      navigator.vibrate?.([30, 40, 30])
    } catch (err) {
      setError(err.message || 'Não foi possível confirmar. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  const reset = () => {
    setName('')
    setAdults(1)
    setChildren(0)
    setMessage('')
    setConfirmed(null)
  }

  if (confirmed) {
    const total = (confirmed.adults || 0) + (confirmed.children || 0)
    return (
      <section ref={successRef} className="g-card px-5 py-8 text-center" aria-live="polite">
        <div className="text-5xl" data-pop>
          🎉
        </div>
        <h2 className="g-title mt-3" style={{ fontSize: 'calc(var(--g-title-size) * 0.72)' }} data-pop>
          Presença Confirmada com Sucesso!
        </h2>
        <p className="g-heading mt-2 text-lg" data-pop>
          Nos vemos na festa 🎉
        </p>
        <p className="g-muted mt-3 text-sm" data-pop>
          {confirmed.name.split(' ')[0]}, reservamos lugar para{' '}
          <b style={{ color: 'var(--g-text)' }}>
            {total} {total === 1 ? 'pessoa' : 'pessoas'}
          </b>
          {confirmed.children ? ` (${confirmed.adults} adulto${confirmed.adults === 1 ? '' : 's'} e ${confirmed.children} criança${confirmed.children === 1 ? '' : 's'})` : ''}.
        </p>
        {preview && (
          <p className="mt-4 rounded-xl bg-amber-400/20 px-3 py-2 text-xs font-semibold" data-pop>
            Modo visualização: esta confirmação não foi salva.
          </p>
        )}
        <button onClick={reset} className="g-muted mt-6 text-sm font-semibold underline underline-offset-4" data-pop>
          Confirmar outra pessoa ou família
        </button>
      </section>
    )
  }

  return (
    <section ref={formRef} className="g-card p-5" aria-labelledby="rsvp-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white" style={{ background: 'var(--g-primary)' }}>
          <PartyPopper className="h-5 w-5" />
        </span>
        <div>
          <h2 id="rsvp-title" className="g-heading text-xl leading-tight">
            Confirme sua presença
          </h2>
          <p className="g-muted text-sm">Leva menos de 30 segundos</p>
        </div>
      </div>

      <form onSubmit={submit} noValidate>
        <label className="g-label" htmlFor="rsvp-name">
          Nome completo
        </label>
        <input
          id="rsvp-name"
          className="g-input"
          placeholder="Ex: Maria Silva"
          autoComplete="name"
          autoCapitalize="words"
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="mt-3 divide-y divide-[color:var(--g-input-border)]">
          <Stepper label="Adultos" sub="Incluindo você" icon={User} value={adults} onChange={setAdults} />
          <Stepper label="Crianças" sub="Até 12 anos" icon={Baby} value={children} onChange={setChildren} />
        </div>

        <label className="g-label mt-3" htmlFor="rsvp-msg">
          Recado para o anfitrião <span className="g-muted font-normal">(opcional)</span>
        </label>
        <textarea
          id="rsvp-msg"
          className="g-input min-h-[92px] resize-none"
          placeholder="Deixe uma mensagem especial 💌"
          maxLength={280}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="g-muted mt-1 text-right text-xs">{message.length}/280</p>

        {error && (
          <p className="mt-2 rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-600" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={sending} className="g-btn g-btn-primary mt-4 w-full text-lg">
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <PartyPopper className="h-5 w-5" />}
          Confirmar Minha Presença
        </button>
      </form>
    </section>
  )
}
