import { useMemo } from 'react'
import { DRIVERS } from '../../data/drivers.js'
import { buildBiweeklyReport, fmtGrams, fmtPct } from '../../utils/mathEngine.js'

const STATUS_CLASSES = {
  verde:     'badge-green',
  amarillo:  'badge-yellow',
  rojo:      'badge-red',
  'sin-datos': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600',
}

const STATUS_LABELS = {
  verde:     '✓ OK ±3%',
  amarillo:  '⚠ Alerta ±5%',
  rojo:      '✗ Crítico >5%',
  'sin-datos': '— Sin datos',
}

export default function BiweeklyTable({ dispatches, dailyReports, onSaveReport }) {
  // Normalise dispatches to the shape buildBiweeklyReport expects:
  // [{ driverId, items: [{ productId, boxes }] }]
  const dispatchesByDriver = useMemo(() => {
    const map = {}
    for (const d of dispatches) {
      if (!map[d.driverId]) map[d.driverId] = []
      for (const it of d.items) {
        const existing = map[d.driverId].find(x => x.productId === it.productId)
        if (existing) existing.boxes += it.boxes
        else map[d.driverId].push({ productId: it.productId, boxes: it.boxes })
      }
    }
    return Object.entries(map).map(([driverId, items]) => ({ driverId, items }))
  }, [dispatches])

  const normalReports = useMemo(() => {
    return dailyReports.map(r => ({
      driverId: r.driverId,
      date:     r.date,
      reports:  r.entries.map(e => ({ productId: e.productId, unitsSold: e.unitsSold })),
    }))
  }, [dailyReports])

  const report = useMemo(
    () => buildBiweeklyReport(dispatchesByDriver, normalReports),
    [dispatchesByDriver, normalReports]
  )

  const allDriverRows = DRIVERS.map(driver => {
    const row = report.find(r => r.driverId === driver.id)
    return row ?? {
      driverId:        driver.id,
      dispatchedGrams: 0,
      reportedGrams:   0,
      diffGrams:       0,
      pctDiff:         0,
      status:          'sin-datos',
    }
  })

  const totals = allDriverRows.reduce((acc, r) => ({
    dispatched: acc.dispatched + r.dispatchedGrams,
    reported:   acc.reported  + r.reportedGrams,
  }), { dispatched: 0, reported: 0 })

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1">Total Despachado</p>
          <p className="text-xl font-bold text-polar-700 tabular-nums">{fmtGrams(totals.dispatched)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1">Total Reportado</p>
          <p className="text-xl font-bold text-green-700 tabular-nums">{fmtGrams(totals.reported)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1">Diferencia Global</p>
          <p className={`text-xl font-bold tabular-nums ${totals.dispatched - totals.reported > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {fmtGrams(Math.abs(totals.dispatched - totals.reported))}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <span className="badge-green">Verde ±3%</span>
        <span className="badge-yellow">Amarillo ±5%</span>
        <span className="badge-red">Rojo &gt;5%</span>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Chofer</th>
                <th className="th text-right">Despachado</th>
                <th className="th text-right">Reportado</th>
                <th className="th text-right">Diferencia</th>
                <th className="th text-right">% Diff</th>
                <th className="th text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {allDriverRows.map(row => {
                const driver = DRIVERS.find(d => d.id === row.driverId)
                return (
                  <tr key={row.driverId} className="hover:bg-slate-50">
                    <td className="td font-medium">{driver?.name ?? row.driverId}</td>
                    <td className="td text-right tabular-nums">{fmtGrams(row.dispatchedGrams)}</td>
                    <td className="td text-right tabular-nums">{fmtGrams(row.reportedGrams)}</td>
                    <td className={`td text-right tabular-nums font-semibold ${row.diffGrams > 0 ? 'text-red-600' : row.diffGrams < 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                      {row.diffGrams !== 0
                        ? `${row.diffGrams > 0 ? '+' : ''}${fmtGrams(row.diffGrams)}`
                        : '—'}
                    </td>
                    <td className="td text-right tabular-nums">{row.status !== 'sin-datos' ? fmtPct(row.pctDiff) : '—'}</td>
                    <td className="td text-center">
                      <span className={STATUS_CLASSES[row.status]}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {onSaveReport && (
        <button onClick={() => onSaveReport(allDriverRows)} className="btn-primary">
          Guardar Reporte Quincenal en Sheets
        </button>
      )}
    </div>
  )
}
