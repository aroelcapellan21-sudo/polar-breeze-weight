import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { lookupFichaForRegister, registerChofer } from '../services/authService.js'

const STEP = { FICHA: 'ficha', SET_PASSWORD: 'setpwd', DONE: 'done' }

export default function RegisterPage() {
  const { user, login } = useAuth()
  const navigate        = useNavigate()

  const [step, setStep]       = useState(STEP.FICHA)
  const [ficha, setFicha]     = useState('')
  const [found, setFound]     = useState(null)     // { _id, ref, nombre }
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [blocked, setBlocked] = useState(null)    // { code, message }

  if (user) return <Navigate to="/dashboard" replace />

  // ── Paso 1: Buscar ficha ────────────────────────────────────────
  const handleLookup = async (e) => {
    e.preventDefault()
    if (!ficha.trim()) return
    setLoading(true)
    setBlocked(null)
    try {
      const data = await lookupFichaForRegister(ficha.trim().toUpperCase())
      setFound(data)
      setStep(STEP.SET_PASSWORD)
    } catch (err) {
      if (err.code === 'ALREADY_REGISTERED') {
        setBlocked({ code: 'ALREADY_REGISTERED', message: err.message })
      } else if (err.code === 'SUSPENDED') {
        setBlocked({ code: 'SUSPENDED', message: err.message })
      } else {
        toast.error(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Paso 2: Establecer contraseña ──────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    if (password.length < 4) return toast.error('La contraseña debe tener al menos 4 caracteres')
    if (password !== confirm)  return toast.error('Las contraseñas no coinciden')
    setLoading(true)
    try {
      const userData = await registerChofer(found.ref, found._id, found.nombre, password)
      login(userData)
      setStep(STEP.DONE)
      toast.success('¡Registro exitoso! Bienvenido.')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-polar-900 via-polar-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <span className="text-3xl">🧊</span>
          </div>
          <h1 className="text-3xl font-black text-white">Primer Acceso</h1>
          <p className="text-polar-300 text-sm mt-1">Registro único de chofer</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-5">
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {['Buscar ficha', 'Contraseña', 'Listo'].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                  i === 0 && step === STEP.FICHA       ? 'bg-polar-600 text-white' :
                  i === 1 && step === STEP.SET_PASSWORD ? 'bg-polar-600 text-white' :
                  i === 2 && step === STEP.DONE         ? 'bg-green-500 text-white' :
                  (i === 0 && step !== STEP.FICHA)      ? 'bg-green-500 text-white' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  {i + 1}
                </div>
                <span className="text-xs text-slate-400 hidden sm:block">{s}</span>
                {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
              </div>
            ))}
          </div>

          {/* Bloqueos */}
          {blocked?.code === 'ALREADY_REGISTERED' && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 text-center space-y-2">
              <p className="text-4xl">🔴</p>
              <p className="font-bold text-red-700 text-lg">Ya estás registrado</p>
              <p className="text-sm text-red-600">{blocked.message}</p>
              <Link to="/login" className="btn-primary inline-block mt-2 text-sm">
                Ir al inicio de sesión
              </Link>
            </div>
          )}

          {blocked?.code === 'SUSPENDED' && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 text-center space-y-2">
              <p className="text-4xl">🔒</p>
              <p className="font-bold text-red-700 text-lg">Acceso suspendido</p>
              <p className="text-sm text-red-600">{blocked.message}</p>
            </div>
          )}

          {/* Paso 1: buscar ficha */}
          {!blocked && step === STEP.FICHA && (
            <form onSubmit={handleLookup} className="space-y-4">
              <p className="text-sm text-slate-500">
                Ingresa tu número de ficha. El administrador te la asignó al crear tu perfil.
              </p>
              <div>
                <label className="label">Número de Ficha</label>
                <input
                  value={ficha}
                  onChange={e => setFicha(e.target.value)}
                  placeholder="CH-42"
                  className="input uppercase text-lg font-mono text-center tracking-widest"
                />
              </div>
              <button type="submit" disabled={loading || !ficha.trim()} className="btn-primary w-full">
                {loading ? 'Buscando...' : 'Buscar mi Ficha →'}
              </button>
            </form>
          )}

          {/* Paso 2: establecer contraseña */}
          {!blocked && step === STEP.SET_PASSWORD && found && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl">👋</span>
                <div>
                  <p className="font-bold text-green-800">¡Hola, {found.nombre}!</p>
                  <p className="text-xs text-green-600">Ficha: {found._id} · Establece tu contraseña</p>
                </div>
              </div>
              <div>
                <label className="label">Nueva contraseña (mín. 4 caracteres)</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Elige una contraseña segura"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className={`input ${confirm && confirm !== password ? 'border-red-400' : ''}`}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Registrando...' : 'Completar Registro'}
              </button>
            </form>
          )}

          {/* Paso 3: listo */}
          {step === STEP.DONE && (
            <div className="text-center space-y-3 py-4">
              <div className="text-6xl">✅</div>
              <p className="text-xl font-bold text-green-700">¡Registro exitoso!</p>
              <p className="text-sm text-slate-500">Redirigiendo al panel...</p>
            </div>
          )}

          {!blocked && (
            <p className="text-center text-xs text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-polar-600 hover:underline">Iniciar sesión</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
