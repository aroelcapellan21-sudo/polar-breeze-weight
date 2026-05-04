import { useState } from 'react'
import SobrantesForm from '../components/Sobrantes/SobrantesForm.jsx'
import SobrantesLog  from '../components/Sobrantes/SobrantesLog.jsx'
import PeriodSelector, { currentPeriod } from '../components/Layout/PeriodSelector.jsx'
import { useSobrantes } from '../hooks/useFirestore.js'
import { fmtGrams } from '../utils/mathEngine.js'

export default function SobrantesPage() {
  const [period, setPeriod] = useState(currentPeriod())
  const [tab, setTab]       = useState('form')
  const { sobrantes, loading } = useSobrantes(period)

  const totalSobranteG = sobrantes.reduce((s, r) => s + (r.totalWeightG ?? 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sobrantes del Día</h1>
          <p className="text-sm text-slate-500">Registro de productos no vendidos retornados por el chofer</p>
        </div>
        <div>
          <label className="label">Período</label>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* Resumen rápido */}
      {sobrantes.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center p-3">
            <p className="text-xs text-slate-500">Registros</p>
            <p className="text-2xl font-black text-amber-700">{sobrantes.length}</p>
          </div>
          <div className="card text-center p-3">
            <p className="text-xs text-slate-500">Peso sobrante total</p>
            <p className="text-2xl font-black text-amber-700 tabular-nums">{fmtGrams(totalSobranteG)}</p>
          </div>
          <div className="card text-center p-3">
            <p className="text-xs text-slate-500">Pendientes Sheets</p>
            <p className="text-2xl font-black text-slate-600">
              {sobrantes.filter(s => !s.syncedToSheets).length}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'form', label: 'Registrar Sobrante' },
          { id: 'log',  label: `Historial (${sobrantes.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'form'
          ? <SobrantesForm onSaved={() => setTab('log')} />
          : <SobrantesLog sobrantes={sobrantes} loading={loading} />
        }
      </div>
    </div>
  )
}
