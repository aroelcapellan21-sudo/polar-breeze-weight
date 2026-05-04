import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, LabelList,
} from 'recharts'
import {
  buildSimBiweekly,
  SIM_PRODUCTS,
  SIM_DISPATCHES,
} from '../../data/simulation.js'

const STATUS_META = {
  verde: {
    bg:    'bg-green-50 border-green-200',
    badge: 'bg-green-500',
    text:  'text-green-700',
    lightClass: 'bg-green-500',
    icon:  '✅',
    label: 'CUADRA',
    desc:  'Diferencia dentro del margen ±3%',
  },
  amarillo: {
    bg:    'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-400',
    text:  'text-yellow-700',
    lightClass: 'bg-yellow-400',
    icon:  '⚠️',
    label: 'ALERTA',
    desc:  'Diferencia entre ±3% y ±5%',
  },
  rojo: {
    bg:    'bg-red-50 border-red-200',
    badge: 'bg-red-500',
    text:  'text-red-700',
    lightClass: 'bg-red-500',
    icon:  '🚨',
    label: 'CRÍTICO',
    desc:  'Diferencia mayor al ±5%',
  },
}

const fmtG   = (g) => g >= 1000 ? `${(g / 1000).toFixed(3)} kg` : `${g} g`
const fmtPct = (p) => `${(Math.abs(p) * 100).toFixed(2)}%`

// ── Semáforo de 3 luces ──────────────────────────────────────────
function Semaforo({ status }) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-slate-800 p-2 rounded-xl">
      {['rojo', 'amarillo', 'verde'].map(s => (
        <div
          key={s}
          className={`w-7 h-7 rounded-full transition-all duration-500 ${
            status === s
              ? `${STATUS_META[s].lightClass} shadow-[0_0_12px_4px] shadow-current`
              : 'bg-slate-600 opacity-30'
          }`}
        />
      ))}
    </div>
  )
}

// ── Barra de progreso peso ───────────────────────────────────────
function WeightBar({ dispatchedG, reportedG, status }) {
  const pct   = Math.min((reportedG / dispatchedG) * 100, 100)
  const colorMap = { verde: 'bg-green-500', amarillo: 'bg-yellow-400', rojo: 'bg-red-500' }
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>0 g</span>
        <span>{fmtG(dispatchedG)} despachado</span>
      </div>
      <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorMap[status]}`}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
          {fmtG(reportedG)} reportado ({(pct).toFixed(1)}% del despacho)
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">Vendido / reportado</span>
        <span className={`font-semibold ${reportedG < dispatchedG ? 'text-red-500' : 'text-green-600'}`}>
          Δ {fmtG(Math.abs(dispatchedG - reportedG))} {reportedG < dispatchedG ? 'sin reportar' : 'sobrante'}
        </span>
      </div>
    </div>
  )
}

// ── Desglose por producto en la tarjeta ──────────────────────────
function ProductBreakdown({ driverId, byProduct }) {
  const items = SIM_DISPATCHES[driverId].items
  return (
    <table className="w-full text-xs border-t border-slate-200 mt-3 pt-2">
      <thead>
        <tr className="text-slate-400">
          <th className="text-left py-1 font-medium">Producto</th>
          <th className="text-right py-1 font-medium">Desp.</th>
          <th className="text-right py-1 font-medium">Vendido</th>
          <th className="text-right py-1 font-medium">Pendiente</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => {
          const p       = SIM_PRODUCTS[item.productId]
          const sold    = byProduct[item.productId] ?? 0
          const pending = item.units - sold
          return (
            <tr key={item.productId}>
              <td className="py-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                {p.name}
              </td>
              <td className="py-1.5 text-right tabular-nums">{item.units} ud</td>
              <td className="py-1.5 text-right tabular-nums font-medium">{sold} ud</td>
              <td className={`py-1.5 text-right tabular-nums font-semibold ${pending > 0 ? 'text-red-500' : 'text-green-600'}`}>
                {pending > 0 ? `−${pending} ud` : '✓ completo'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Gráfica comparativa horizontal ──────────────────────────────
function ComparisonChart({ results }) {
  const data = results.flatMap(r => [
    { name: `${r.driver.code} Despachado`, kg: +(r.dispatchedG / 1000).toFixed(3), tipo: 'desp',  status: r.status },
    { name: `${r.driver.code} Reportado`,  kg: +(r.reportedG   / 1000).toFixed(3), tipo: 'rep',   status: r.status },
  ])

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Comparativa Final: Despachado vs Reportado (kg)
      </p>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} layout="vertical" barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" kg" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#475569' }} width={120} />
          <Tooltip formatter={(v, _n, p) => [`${v} kg`, p.payload.tipo === 'desp' ? 'Despachado' : 'Reportado']} />
          <Bar dataKey="kg" radius={[0, 5, 5, 0]}>
            <LabelList
              dataKey="kg"
              position="right"
              style={{ fontSize: 10, fill: '#475569' }}
              formatter={v => `${v} kg`}
            />
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.tipo === 'desp' ? '#0284c7' :
                  entry.status === 'verde'    ? '#16a34a' :
                  entry.status === 'amarillo' ? '#d97706' : '#dc2626'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────
export default function BiweeklyResult() {
  const results = buildSimBiweekly()

  return (
    <div className="space-y-6">
      {/* Tarjetas individuales por chofer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {results.map(r => {
          const meta = STATUS_META[r.status]
          return (
            <div key={r.driver.id} className={`rounded-xl border-2 p-5 space-y-4 ${meta.bg}`}>
              {/* Header chofer + semáforo */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-mono text-xs text-slate-400">{r.driver.code} · {r.driver.route}</p>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">{r.driver.name}</h3>
                  <p className={`text-3xl font-black tabular-nums mt-1 ${meta.text}`}>
                    {fmtPct(r.pct)}
                  </p>
                  <p className={`text-xs font-bold uppercase mt-0.5 ${meta.text}`}>
                    {meta.icon} {meta.label} — {meta.desc}
                  </p>
                </div>
                <Semaforo status={r.status} />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Despachado', val: fmtG(r.dispatchedG), cls: 'text-blue-700'  },
                  { label: 'Reportado',  val: fmtG(r.reportedG),   cls: meta.text         },
                  { label: 'Diferencia', val: fmtG(r.diffG),        cls: r.diffG > 0 ? 'text-red-600' : 'text-green-600' },
                ].map(s => (
                  <div key={s.label} className="bg-white/70 rounded-lg py-2 px-1">
                    <p className="text-xs text-slate-400">{s.label}</p>
                    <p className={`text-sm font-bold tabular-nums ${s.cls}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Barra de progreso */}
              <WeightBar dispatchedG={r.dispatchedG} reportedG={r.reportedG} status={r.status} />

              {/* Desglose por producto */}
              <ProductBreakdown driverId={r.driver.id} byProduct={r.byProduct} />
            </div>
          )
        })}
      </div>

      {/* Gráfica comparativa */}
      <div className="card">
        <ComparisonChart results={results} />
      </div>

      {/* Tabla resumen */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-slate-800 px-4 py-3">
          <h4 className="text-white font-semibold text-sm">Resumen Quincenal Oficial</h4>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Chofer', 'Despachado', 'Reportado', 'Diferencia', '% Diff', 'Estado'].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map(r => {
              const meta = STATUS_META[r.status]
              return (
                <tr key={r.driver.id} className="hover:bg-slate-50">
                  <td className="td">
                    <span className="font-mono text-xs text-slate-400">{r.driver.code}</span>
                    <span className="ml-2 font-semibold">{r.driver.name}</span>
                  </td>
                  <td className="td text-right tabular-nums text-blue-700 font-medium">{fmtG(r.dispatchedG)}</td>
                  <td className={`td text-right tabular-nums font-medium ${meta.text}`}>{fmtG(r.reportedG)}</td>
                  <td className={`td text-right tabular-nums font-semibold ${r.diffG > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {r.diffG !== 0 ? (r.diffG > 0 ? '+' : '') + fmtG(r.diffG) : '—'}
                  </td>
                  <td className={`td text-right tabular-nums font-bold text-lg ${meta.text}`}>
                    {fmtPct(r.pct)}
                  </td>
                  <td className="td text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white ${meta.badge}`}>
                      {meta.icon} {meta.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        <span className="font-semibold text-slate-600">Tolerancias:</span>
        {[
          { color: 'bg-green-500',  label: 'Verde  ≤ ±3% — Aceptable'       },
          { color: 'bg-yellow-400', label: 'Amarillo ±3–5% — Revisar'        },
          { color: 'bg-red-500',    label: 'Rojo  > ±5% — Auditar chofer'    },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
