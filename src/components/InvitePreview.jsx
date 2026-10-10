import { useEffect } from 'react'
import { CalendarDays, Clock, Gift, MapPin } from 'lucide-react'
import { getTheme, loadThemeFonts } from '../lib/themes'
import { formatDateLong, formatTime } from '../lib/utils'
import ThemeDecor from '../guest/ThemeDecor'

/** Mini-celular com prévia ao vivo do convite enquanto o anfitrião edita */
export default function InvitePreview({ party, caption }) {
  const theme = getTheme(party.theme)
  useEffect(() => loadThemeFonts(theme.id), [theme.id])

  const hasDate = Boolean(party.date)

  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="relative overflow-hidden rounded-[2.4rem] border-[9px] border-slate-900 bg-slate-900 shadow-2xl ring-1 ring-black/10 dark:border-slate-700">
        <div className="absolute left-1/2 top-1.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900 dark:bg-slate-700" />
        <div className={`${theme.className} g-root relative h-[540px] overflow-hidden`} style={{ minHeight: 0 }}>
          <ThemeDecor theme={theme.id} compact />
          <div className="relative z-10 space-y-3 px-3.5 pb-4 pt-9">
            <div className="g-card overflow-hidden p-0">
              <div className="aspect-[4/3] overflow-hidden" style={{ borderRadius: 'calc(var(--g-radius) - 2px) calc(var(--g-radius) - 2px) 0 0' }}>
                {party.coverImage ? (
                  <img src={party.coverImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-5xl" style={{ background: 'var(--g-hero)' }}>{theme.emoji}</div>
                )}
              </div>
              <div className="px-3.5 pb-4 pt-3 text-center">
                <p className="g-eyebrow" style={{ fontSize: '0.55rem' }}>
                  {theme.invitedLabel}
                </p>
                <h3 className="g-title mt-1.5" style={{ fontSize: `calc(var(--g-title-size) * 0.62)` }}>
                  {party.title || 'Título da sua festa'}
                </h3>
                <div className="mt-2.5 flex flex-wrap justify-center gap-1.5 text-[0.65rem] font-semibold">
                  <span className="g-soft inline-flex items-center gap-1 rounded-full px-2 py-1">
                    <CalendarDays className="h-3 w-3" />
                    {hasDate ? formatDateLong(party).split(',')[1]?.trim() || formatDateLong(party) : 'Data'}
                  </span>
                  <span className="g-soft inline-flex items-center gap-1 rounded-full px-2 py-1">
                    <Clock className="h-3 w-3" />
                    {party.time ? formatTime(party) : 'Hora'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {['Dias', 'Horas', 'Min', 'Seg'].map((l, i) => (
                <div key={l} className="g-card px-1 py-2 text-center">
                  <div className="g-count-num text-lg font-bold leading-none">{['12', '08', '45', '30'][i]}</div>
                  <div className="g-muted mt-1 text-[0.55rem] font-semibold uppercase">{l}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="g-btn g-btn-primary !min-h-[38px] !px-2 !text-[0.7rem]">
                <MapPin className="h-3.5 w-3.5" /> Como Chegar
              </div>
              <div className={`g-btn g-btn-outline !min-h-[38px] !px-2 !text-[0.7rem] ${party.pixEnabled ? '' : 'opacity-40'}`}>
                <Gift className="h-3.5 w-3.5" /> Pix
              </div>
            </div>

            <div className="g-card p-3">
              <p className="g-heading text-sm">Confirme sua presença</p>
              <div className="g-input mt-2 !py-2 text-[0.7rem] opacity-70">Seu nome completo</div>
              <div className="g-btn g-btn-primary mt-2 !min-h-[36px] w-full !text-[0.72rem]">Confirmar Minha Presença</div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">{caption ?? `Prévia ao vivo · ${theme.name}`}</p>
    </div>
  )
}
