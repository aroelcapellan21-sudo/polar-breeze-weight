import { useState } from 'react'
import DailyReportForm from '../components/DailyReports/DailyReportForm.jsx'
import DailyReportLog from '../components/DailyReports/DailyReportLog.jsx'
import DriverAccumulator from '../components/DailyReports/DriverAccumulator.jsx'
import { useDailyReports } from '../hooks/useLocalStore.js'

export default function ReportsPage() {
  const { reports, add } = useDailyReports()
  const [tab, setTab] = useState('form')

  const handleSaved = (report) => {
    add(report.driverId, report.entries, report.period)
  }

  const tabs = [
    { id: 'form',     label: 'Nuevo Reporte'               },
    { id: 'log',      label: `Historial (${reports.length})` },
    { id: 'acum',     label: 'Acumulado por Chofer'          },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reportes Diarios</h1>
        <p className="text-sm text-slate-500">Registro de unidades vendidas por chofer cada día</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-polar-600 text-polar-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'form' && <DailyReportForm onSaved={handleSaved} />}
        {tab === 'log'  && <DailyReportLog  reports={reports} />}
        {tab === 'acum' && <DriverAccumulator reports={reports} />}
      </div>
    </div>
  )
}
