import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Lock, LogIn, Sparkles } from 'lucide-react'
import { repo, isDemo } from '../services/repository'
import { navigate } from '../hooks/useRoute'
import { isNative } from '../lib/native'
import Logo from './Logo'

/** Tela de entrada do painel do buffet */
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Entrar · Festify'
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await repo.signIn(email, password)
    } catch (err) {
      setError(err.message || 'Não foi possível entrar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-[radial-gradient(ellipse_at_top,rgba(196,46,245,0.15),transparent_60%)] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="card p-6">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-3 text-center text-xl font-extrabold">Área do buffet</h1>

          {isDemo ? (
            <>
              <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
                Você está no <b>modo demonstração</b>: os dados ficam só neste aparelho e não há senha.
              </p>
              <button onClick={() => repo.signIn()} className="btn-primary mt-5 w-full">
                <Sparkles className="h-4 w-4" /> Entrar no modo demonstração
              </button>
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                Para proteger com senha e compartilhar temas e convites de verdade, conecte o Supabase (veja o
                GUIA-SUPABASE).
              </p>
            </>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-3">
              <div>
                <label className="label" htmlFor="email">
                  E-mail
                </label>
                <input id="email" type="email" autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  Senha
                </label>
                <input id="password" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Entrar
              </button>
            </form>
          )}
        </div>
        {!isNative() && (
          <button onClick={() => navigate({})} className="btn-ghost mx-auto mt-4 flex">
            <ArrowLeft className="h-4 w-4" /> Voltar para a biblioteca de temas
          </button>
        )}
      </div>
    </div>
  )
}
