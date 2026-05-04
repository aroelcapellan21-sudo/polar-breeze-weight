import { useState } from 'react'
import VueltaForm from '../components/Vueltas/VueltaForm.jsx'
import VueltaLog  from '../components/Vueltas/VueltaLog.jsx'
import PeriodSelector, { currentPeriod } from '../components/Layout/PeriodSelector.jsx'
import { useVueltas } from '../hooks/useFirestore.js'
import { fmtGrams } from '../utils/mathEngine.js'

const STATUS_COUNT = (vueltas) => ({
  cuadra:    vueltas.filter(v => v.status === 'cuadra').length,
  revisar:   vueltas.filter(v => v.status === 'revisar').length,
  auditoria: vueltas.filter(v => v.status === 'auditoria').length,
})

export default function VueltasPage() {
  const [period, setPeriod] = useState(currentPeriod())
  const [tab, setTab]       = useState('form')
  const { vueltas, loading } = useVueltas(period)

  const counts     = STATUS_COUNT(vueltas)
  const totalVendG = vueltas.reduce((s, v) => s + (v.totalVendidoG ?? 0), 0)
  const totalRetG  = vueltas.reduce((s, v) => s + (v.totalRetornadoG ?? 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vueltas — Ficha del Chofer</h1>
          <p className="text-sm text-slate-500">
            Liquidación al regreso: despacho → retorno → vendido · Genera ficha imprimible
          </p>
        </div>
        <div>
          <label className="label">Período</label>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* Dashboard rápido */}
      {vueltas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="card text-center p-3 col-span-2 md:col-span-1">
            <p className="text-xs text-slate-500">Total vueltas</p>
            <p className="text-2xl font-black text-teal-700">{vueltas.length}</p>
          </div>
          <div className="card text-center p-3 border-l-4 border-green-400">
            <p className="text-xs text-slate-500">Cuadra</p>
            <p className="text-2xl font-black text-green-600">{counts.cuadra}</p>
          </div>
          <div className="card text-center p-3 border-l-4 border-yellow-400">
            <p className="text-xs text-slate-500">Revisar</p>
            <p className="text-2xl font-black text-yellow-600">{counts.revisar}</p>
          </div>
          <div className="card text-center p-3 border-l-4 border-red-400">
            <p className="text-xs text-slate-500">Auditoría</p>
            <p className="text-2xl font-black text-red-600">{counts.auditoria}</p>
          </div>
          <div className="card text-center p-3">
            <p className="text-xs text-slate-500">Kg vendido total</p>
            <p className="text-lg font-black text-teal-700 tabular-nums">{(totalVendG / 1000).toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Alerta si hay auditorías pendientes */}
      {counts.auditoria > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold text-red-800">
              {counts.auditoria} vuelta{counts.auditoria > 1 ? 's' : ''} requiere{counts.auditoria === 1 ? '' : 'n'} auditoría
            </p>
            <p className="text-sm text-red-600">Diferencia de peso superior al ±5%. Revisar fichas en el historial.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'form', label: 'Registrar Vuelta' },
          { id: 'log',  label: `Historial (${vueltas.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-teal-500 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'form'
          ? <VueltaForm onSaved={() => setTab('log')} />
          : <VueltaLog vueltas={vueltas} loading={loading} />
        }
      </div>
    </div>
  )
}
