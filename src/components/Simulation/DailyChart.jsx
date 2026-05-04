import {
  ResponsiveContainer,
  ComposedChart, BarChart,
  Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, Label,
} from 'recharts'
import { SIM_PRODUCTS, buildDailyChartData, buildCumulativeChartData } from '../../data/simulation.js'

// ── Tooltip personalizado ────────────────────────────────────────
function DailyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const date = payload[0]?.payload?.date
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label} — {date}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.fill || p.color }}>
          {SIM_PRODUCTS[p.dataKey]?.name ?? p.name}: <strong>{p.value}</strong> ud
        </p>
      ))}
    </div>
  )
}

function CumTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const date   = payload[0]?.payload?.date
  const cumKg  = payload.find(p => p.dataKey === 'cumKg')?.value
  const limitKg = payload[0]?.payload?.limitKg
  const pct    = limitKg ? ((cumKg / limitKg) * 100).toFixed(1) : 0
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label} — {date}</p>
      <p className="text-blue-600">Acumulado: <strong>{cumKg} kg</strong></p>
      <p className="text-red-500">Límite: {limitKg} kg</p>
      <p className="text-slate-500">Consumido: {pct}%</p>
    </div>
  )
}

// ── Gráfica de unidades diarias ──────────────────────────────────
export function DailyUnitsChart({ driverId }) {
  const data       = buildDailyChartData(driverId)
  const productIds = Object.keys(data[0] || {}).filter(k => k.startsWith('PB-'))

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Unidades vendidas por día
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={28} />
          <Tooltip content={<DailyTooltip />} />
          <Legend
            formatter={(v) => (
              <span className="text-xs text-slate-600">{SIM_PRODUCTS[v]?.name ?? v}</span>
            )}
          />
          {productIds.map(pid => (
            <Bar
              key={pid}
              dataKey={pid}
              stackId="a"
              fill={SIM_PRODUCTS[pid]?.color ?? '#94a3b8'}
              radius={pid === productIds[productIds.length - 1] ? [3, 3, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Gráfica de peso acumulado ────────────────────────────────────
export function CumulativeWeightChart({ driverId }) {
  const data    = buildCumulativeChartData(driverId)
  const limitKg = data[0]?.limitKg ?? 0

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Peso acumulado vs límite despachado (kg)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id={`grad-${driverId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#0284c7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis
            domain={[0, +(limitKg * 1.1).toFixed(1)]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            width={36}
          />
          <Tooltip content={<CumTooltip />} />
          <ReferenceLine
            y={limitKg}
            stroke="#ef4444"
            strokeDasharray="6 3"
            strokeWidth={2}
          >
            <Label value={`Límite: ${limitKg} kg`} position="insideTopRight" fill="#ef4444" fontSize={10} />
          </ReferenceLine>
          <Area
            type="monotone"
            dataKey="cumKg"
            stroke="#0284c7"
            strokeWidth={2}
            fill={`url(#grad-${driverId})`}
            name="Acumulado"
          />
          <Bar dataKey="dailyKg" fill="#bae6fd" opacity={0.5} name="Peso diario" barSize={12} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
