import { useState } from 'react'
import toast from 'react-hot-toast'
import BiweeklyTable from '../components/BiweeklyCheck/BiweeklyTable.jsx'
import PeriodSelector, { currentPeriod } from '../components/Layout/PeriodSelector.jsx'
import { useDispatches, useDailyReports } from '../hooks/useLocalStore.js'
import { saveBiweeklyReport } from '../services/sheetsService.js'
import { useSheets } from '../hooks/useSheets.js'

export default function BiweeklyPage() {
  const { signedIn } = useSheets()
  const { dispatches } = useDispatches()
  const { reports }    = useDailyReports()
  const [period, setPeriod] = useState(currentPeriod())

  const filteredDispatches = dispatches.filter(d => d.period === period)
  const filteredReports    = reports.filter(r => r.period === period)

  const handleSaveReport = async (rows) => {
    if (!signedIn) return toast.error('Conecta Google Sheets primero')
    try {
      await saveBiweeklyReport(period, rows)
      toast.success('Reporte quincenal guardado en Sheets')
    } catch (err) {
      toast.error(err.message || 'Error al guardar en Sheets')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cruce Quincenal</h1>
          <p className="text-sm text-slate-500">
            Peso despachado vs. reportado — tolerancia ±3% verde · ±5% amarillo · +5% rojo
          </p>
        </div>
        <div>
          <label className="label">Período</label>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>Despachos en período: <strong>{filteredDispatches.length}</strong></span>
        <span>Reportes en período: <strong>{filteredReports.length}</strong></span>
      </div>

      <BiweeklyTable
        dispatches={filteredDispatches}
        dailyReports={filteredReports}
        onSaveReport={signedIn ? handleSaveReport : null}
      />
    </div>
  )
}
