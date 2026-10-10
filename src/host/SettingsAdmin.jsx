import { useEffect, useState } from 'react'
import { Check, Copy, ExternalLink, ImagePlus, Loader2, MessageCircle, Trash2 } from 'lucide-react'
import { repo, isDemo } from '../services/repository'
import { useSettings } from '../hooks/useData'
import { compressImage, copyText, hasPublicUrl, libraryUrl, normalizeWhatsApp, whatsappLink, NO_PUBLIC_URL_MSG } from '../lib/utils'
import { useToast } from '../components/ui/Toast'

const EMPTY = { buffetName: '', tagline: '', whatsapp: '', address: '', mapsUrl: '', logo: '' }

export default function SettingsAdmin() {
  const toast = useToast()
  const { settings, loading } = useSettings()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!loading) setForm({ ...EMPTY, ...settings })
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const bind = (k) => ({ value: form[k] || '', onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })) })
  const digits = normalizeWhatsApp(form.whatsapp)
  const waValid = !form.whatsapp || (digits.length >= 12 && digits.length <= 13)

  const save = async (e) => {
    e.preventDefault()
    if (!form.buffetName.trim()) return toast('Informe o nome do buffet', 'error')
    if (!waValid) return toast('WhatsApp inválido — use DDD + número', 'error')
    setSaving(true)
    try {
      await repo.saveSettings({ ...form, buffetName: form.buffetName.trim() })
      toast('Ajustes salvos!')
    } catch (err) {
      toast(err.message, 'error', 4500)
    } finally {
      setSaving(false)
    }
  }

  const onLogo = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const data = await compressImage(file, 400, 0.85)
      const url = await repo.uploadImage(data, 'brand')
      setForm((f) => ({ ...f, logo: url }))
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const copyLibrary = async () => {
    if (!hasPublicUrl()) return toast(NO_PUBLIC_URL_MSG, 'info', 5000)
    const ok = await copyText(libraryUrl())
    toast(ok ? 'Link da biblioteca copiado!' : 'Não foi possível copiar', ok ? 'success' : 'error')
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">Painel do buffet</p>
      <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Ajustes</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Essas informações aparecem na biblioteca pública e nos convites.</p>

      {/* Link público */}
      <div className="card mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Link da biblioteca de temas</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Divulgue no Instagram, WhatsApp e bio.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyLibrary} className="btn-primary">
            <Copy className="h-4 w-4" /> Copiar link
          </button>
          <a href={hasPublicUrl() ? libraryUrl() : './'} target="_blank" rel="noreferrer" className="btn-secondary">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <form onSubmit={save} className="card mt-4 space-y-5 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <label className="relative grid h-20 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-brand-300 dark:border-white/10 dark:bg-white/5">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            ) : form.logo ? (
              <img src={form.logo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus className="h-6 w-6 text-slate-400" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => (onLogo(e.target.files?.[0]), (e.target.value = ''))} />
          </label>
          <div className="text-sm">
            <p className="font-semibold">Logo do buffet</p>
            <p className="text-slate-500 dark:text-slate-400">Quadrada, aparece no topo da biblioteca.</p>
            {form.logo && (
              <button type="button" onClick={() => setForm((f) => ({ ...f, logo: '' }))} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                <Trash2 className="h-3.5 w-3.5" /> Remover
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="label">Nome do buffet</label>
          <input className="input" placeholder="Ex.: Buffet Magia & Farra" {...bind('buffetName')} />
        </div>
        <div>
          <label className="label">Frase de destaque</label>
          <input className="input" placeholder="Escolha o tema da sua festa e receba o convite online" {...bind('tagline')} />
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-400/20">
          <label className="label flex items-center gap-1.5 text-emerald-800 dark:text-emerald-200">
            <MessageCircle className="h-4 w-4" /> WhatsApp do buffet
          </label>
          <input className={`input ${waValid ? '' : 'input-error'}`} inputMode="tel" placeholder="(11) 91234-5678" {...bind('whatsapp')} />
          <p className="hint">
            Para onde vão os pedidos do botão <b>“Pedir convite online”</b>. Use DDD + número.
          </p>
          {form.whatsapp && waValid && (
            <a
              href={whatsappLink(form.whatsapp, 'Teste do Festify ✅')}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
            >
              <Check className="h-4 w-4" /> Testar número (+{digits})
            </a>
          )}
        </div>

        <div>
          <label className="label">Endereço do buffet</label>
          <textarea className="input min-h-[72px]" placeholder="Rua, número, bairro, cidade - UF" {...bind('address')} />
          <p className="hint">Usado como padrão nos convites novos e nas demonstrações.</p>
        </div>
        <div>
          <label className="label">
            Link do Google Maps <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input className="input" type="url" placeholder="https://maps.app.goo.gl/..." {...bind('mapsUrl')} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Salvar ajustes
        </button>
      </form>

      {isDemo && (
        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          <b>Modo demonstração:</b> tudo fica salvo só neste aparelho. Conecte o Supabase para que clientes e convidados vejam seus temas
          e convites (veja o GUIA-SUPABASE).
        </p>
      )}
    </div>
  )
}
