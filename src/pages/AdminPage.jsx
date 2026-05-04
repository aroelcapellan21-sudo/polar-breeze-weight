import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import DriverManager   from '../components/Admin/DriverManager.jsx'
import CreateDriverForm from '../components/Admin/CreateDriverForm.jsx'
import { useChoferesAdmin } from '../hooks/useFirestore.js'
import { changeAdminPassword } from '../services/authService.js'
import { currentPeriod, periodLabel } from '../components/Layout/PeriodSelector.jsx'

const TABS = [
  { id: 'choferes', label: '👥 Choferes'    },
  { id: 'crear',    label: '➕ Crear Chofer' },
  { id: 'config',   label: '⚙️ Configuración'},
]

function AdminConfig() {
  const [pwd, setPwd]     = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving]   = useState(false)

  const handleChange = async (e) => {
    e.preventDefault()
    if (pwd.length < 6) return toast.error('Mínimo 6 caracteres')
    if (pwd !== confirm)  return toast.error('Las contraseñas no coinciden')
    setSaving(true)
    try {
      await changeAdminPassword(pwd)
      toast.success('Contraseña admin actualizada')
      setPwd(''); setConfirm('')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-md space-y-5">
      <div className="card">
        <h3 className="font-bold text-slate-700 mb-4">Cambiar Contraseña Admin</h3>
        <form onSubmit={handleChange} className="space-y-3">
          <div>
            <label className="label">Nueva contraseña</label>
            <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} className="input" placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="label">Confirmar contraseña</label>
            <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} className={`input ${confirm && confirm!==pwd ? 'border-red-400':''}`} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full bg-slate-700 hover:bg-slate-800">
            {saving ? 'Guardando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
      <div className="card space-y-2 text-sm text-slate-600">
        <p className="font-semibold text-slate-700">Notas de seguridad</p>
        <p>• La contraseña se almacena como hash SHA-256 en Firestore.</p>
        <p>• Para mayor seguridad, activa <strong>Firebase Authentication</strong> en producción.</p>
        <p>• Configura las <strong>Firestore Security Rules</strong> para restringir acceso.</p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [tab, setTab] = useState('choferes')
  const { choferes, loading, refetch } = useChoferesAdmin()

  const period = currentPeriod()

  const stats = {
    total:   choferes.length,
    activos: choferes.filter(c => c.status !== 'baja').length,
    bajas:   choferes.filter(c => c.status === 'baja').length,
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest">Panel Administrativo</p>
            <h1 className="text-2xl font-black mt-0.5">Admin Soberano</h1>
            <p className="text-slate-400 text-sm mt-1">
              {periodLabel(period)} · Sesión: <strong className="text-white">{user?.nombre}</strong>
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Ver Dashboard →
          </button>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Total Choferes', val: stats.total,   color: 'text-white'     },
            { label: '✅ Activos',      val: stats.activos, color: 'text-green-400' },
            { label: '🔒 Bajas',        val: stats.bajas,   color: 'text-red-400'   },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className={`text-2xl font-black tabular-nums ${s.color}`}>{s.val}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'choferes' && (
        <DriverManager choferes={choferes} loading={loading} onRefresh={refetch} />
      )}
      {tab === 'crear' && (
        <div className="card max-w-xl">
          <h2 className="font-bold text-slate-700 mb-4">Crear Perfil de Chofer</h2>
          <CreateDriverForm onCreated={() => setTab('choferes')} />
        </div>
      )}
      {tab === 'config' && <AdminConfig />}
    </div>
  )
}
