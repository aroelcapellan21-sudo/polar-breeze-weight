import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { loginChofer, loginAdmin } from '../services/authService.js'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate        = useNavigate()
  const [tab, setTab]   = useState('chofer')

  // Chofer fields
  const [ficha, setFicha]       = useState('')
  const [password, setPassword] = useState('')
  // Admin field
  const [adminPwd, setAdminPwd] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleChofer = async (e) => {
    e.preventDefault()
    if (!ficha.trim() || !password) return
    setLoading(true)
    try {
      const userData = await loginChofer(ficha.trim().toUpperCase(), password)
      login(userData)
      toast.success(`Bienvenido, ${userData.nombre}`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdmin = async (e) => {
    e.preventDefault()
    if (!adminPwd) return
    setLoading(true)
    try {
      const userData = await loginAdmin(adminPwd)
      login(userData)
      toast.success(`Bienvenido, ${userData.nombre}`)
      navigate('/admin')
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur">
            <span className="text-3xl">🧊</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Polar Breeze</h1>
          <p className="text-polar-300 text-sm mt-1">Sistema de Control por Peso</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex">
            {[
              { id: 'chofer', label: '🚚 Soy Chofer' },
              { id: 'admin',  label: '⚙️ Administrador' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${
                  tab === t.id
                    ? 'border-polar-600 text-polar-700 bg-polar-50'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'chofer' && (
              <form onSubmit={handleChofer} className="space-y-4">
                <div>
                  <label className="label">Número de Ficha</label>
                  <input
                    value={ficha}
                    onChange={e => setFicha(e.target.value)}
                    placeholder="CH-42"
                    className="input uppercase"
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="label">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      className="input pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Verificando...' : 'Iniciar Sesión'}
                </button>
                <p className="text-center text-xs text-slate-400">
                  ¿Primera vez?{' '}
                  <Link to="/register" className="text-polar-600 hover:underline font-medium">
                    Regístrate aquí
                  </Link>
                </p>
              </form>
            )}

            {tab === 'admin' && (
              <form onSubmit={handleAdmin} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                  Contraseña por defecto: <strong>admin1234</strong> · Cámbiala en el panel admin.
                </div>
                <div>
                  <label className="label">Contraseña Admin</label>
                  <input
                    type="password"
                    value={adminPwd}
                    onChange={e => setAdminPwd(e.target.value)}
                    placeholder="Contraseña de administrador"
                    className="input"
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full bg-slate-700 hover:bg-slate-800">
                  {loading ? 'Verificando...' : 'Acceder como Admin'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-polar-400 text-xs mt-6">
          Polar Breeze Weight v1.1 · Firebase + Google Sheets
        </p>
      </div>
    </div>
  )
}
