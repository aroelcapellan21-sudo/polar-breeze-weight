import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { loginAdmin } from '../services/authService.js'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate        = useNavigate()
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    try {
      const userData = await loginAdmin(password)
      login(userData)
      toast.success(`Bienvenido, ${userData.nombre}`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-polar-900 via-polar-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl mb-4 backdrop-blur">
            <span className="text-4xl">🧊</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Polar Breeze</h1>
          <p className="text-polar-300 text-sm mt-1">Control de Inventario por Peso</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-7 space-y-5">
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Acceso Administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Contraseña de administrador"
                  className="input pr-10"
                  autoFocus
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !password} className="btn-primary w-full py-3 text-base">
              {loading ? 'Verificando...' : 'Entrar al Panel'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Contraseña por defecto: <strong className="text-slate-600">admin1234</strong><br />
            Cámbiala desde ⚙️ Configuración
          </p>
        </div>

        <p className="text-center text-polar-500 text-xs mt-6">
          Polar Breeze Weight v1.2 · Firebase + Google Sheets
        </p>
      </div>
    </div>
  )
}
