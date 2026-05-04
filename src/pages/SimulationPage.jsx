import { useState } from 'react'
import {
  SIM_DRIVERS, SIM_DISPATCHES, SIM_PRODUCTS,
  SIM_DAILY_REPORTS, SIM_DAYS, SIM_LABEL,
} from '../data/simulation.js'
import { DailyUnitsChart, CumulativeWeightChart } from '../components/Simulation/DailyChart.jsx'
import BiweeklyResult from '../components/Simulation/BiweeklyResult.jsx'

const DRIVER_IDS = Object.keys(SIM_DRIVERS)

const TABS = [
  { id: 'despacho',  label: 'Despacho Día 1'         },
  { id: 'diario',    label: 'Reportes 15 Días'        },
  { id: 'quincena',  label: 'Cruce Quincenal'         },
]

// ── Tarjeta de despacho ──────────────────────────────────────────
function DispatchCard({ driverId }) {
  const driver   = SIM_DRIVERS[driverId]
  const dispatch = SIM_DISPATCHES[driverId]

  return (
    <div className="card flex flex-col gap-4">
      {/* Chofer */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="w-12 h-12 rounded-full bg-polar-100 flex items-center justify-center">
          <span className="text-polar-700 font-black text-sm">{driver.code}</span>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{driver.name}</h3>
          <p className="text-xs text-slate-400">{driver.route}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-400">Día 1 — 2026-05-01</p>
          <p className="text-2xl font-black text-polar-700 tabular-nums">
            {(dispatch.totalG / 1000).toFixed(3)} kg
          </p>
          <p className="text-xs text-slate-500">total despachado</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {dispatch.items.map(item => {
          const p = SIM_PRODUCTS[item.productId]
          return (
            <div key={item.productId} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                <p className="text-xs text-slate-400">{p.unitG} g/ud · {p.unitsBox} ud/caja</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700 tabular-nums">{item.boxes} cajas</p>
                <p className="text-xs text-slate-400 tabular-nums">{item.units} ud · {(item.totalG / 1000).toFixed(3)} kg</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div className="bg-polar-50 rounded-lg flex items-center justify-between px-4 py-2">
        <span className="text-xs font-semibold text-polar-700 uppercase tracking-wide">
          {dispatch.items.reduce((s, i) => s + i.boxes, 0)} cajas ·{' '}
          {dispatch.items.reduce((s, i) => s + i.units, 0)} unidades
        </span>
        <span className="text-sm font-black text-polar-800 tabular-nums">
          {dispatch.totalG.toLocaleString()} g
        </span>
      </div>
    </div>
  )
}

// ── Tabla de reportes diarios ────────────────────────────────────
function DailyTable({ driverId }) {
  const driver   = SIM_DRIVERS[driverId]
  const reports  = SIM_DAILY_REPORTS[driverId]
  const products = [...new Set(reports.flatMap(r => r.entries.map(e => e.productId)))]
  let cumG = 0

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="th">Día</th>
              <th className="th">Fecha</th>
              {products.map(pid => (
                <th key={pid} className="th text-right">
                  <span className="flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: SIM_PRODUCTS[pid].color }} />
                    {SIM_PRODUCTS[pid].name}
                  </span>
                </th>
              ))}
              <th className="th text-right">Peso día</th>
              <th className="th text-right">Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => {
              cumG += r.totalWeightG
              const isToday = r.date === '2026-05-03'
              return (
                <tr key={r.date} className={`${isToday ? 'bg-polar-50' : 'hover:bg-slate-50'}`}>
                  <td className="td font-mono font-bold text-slate-500">D{i + 1}</td>
                  <td className="td text-slate-500">
                    {r.date}
                    {isToday && <span className="ml-1 text-polar-500 text-xs">(hoy)</span>}
                  </td>
                  {products.map(pid => {
                    const entry = r.entries.find(e => e.productId === pid)
                    return (
                      <td key={pid} className="td text-right tabular-nums">
                        <span className="font-semibold">{entry?.unitsSold ?? 0}</span>
                        <span className="text-slate-400 ml-1">ud</span>
                      </td>
                    )
                  })}
                  <td className="td text-right tabular-nums font-medium">
                    {(r.totalWeightG / 1000).toFixed(3)} kg
                  </td>
                  <td className="td text-right tabular-nums font-bold text-polar-700">
                    {(cumG / 1000).toFixed(3)} kg
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold">
              <td colSpan={2} className="td text-slate-500">TOTAL 15 DÍAS</td>
              {products.map(pid => {
                const total = reports.reduce((s, r) => {
                  const e = r.entries.find(e => e.productId === pid)
                  return s + (e?.unitsSold ?? 0)
                }, 0)
                return (
                  <td key={pid} className="td text-right tabular-nums" style={{ color: SIM_PRODUCTS[pid].color }}>
                    {total} ud
                  </td>
                )
              })}
              <td className="td text-right tabular-nums text-green-700">
                {(SIM_DAILY_REPORTS[driverId].reduce((s, r) => s + r.totalWeightG, 0) / 1000).toFixed(3)} kg
              </td>
              <td className="td text-right tabular-nums text-polar-700">
                {(SIM_DAILY_REPORTS[driverId].reduce((s, r) => s + r.totalWeightG, 0) / 1000).toFixed(3)} kg
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ── Sección de reportes diarios con gráficas ─────────────────────
function DailySection({ activeDriver, setActiveDriver }) {
  return (
    <div className="space-y-4">
      {/* Driver tabs */}
      <div className="flex gap-2">
        {DRIVER_IDS.map(id => {
          const d = SIM_DRIVERS[id]
          return (
            <button
              key={id}
              onClick={() => setActiveDriver(id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeDriver === id
                  ? 'bg-polar-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.code} {d.name}
            </button>
          )
        })}
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <DailyUnitsChart driverId={activeDriver} />
        </div>
        <div className="card">
          <CumulativeWeightChart driverId={activeDriver} />
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-semibold text-slate-700">
            Detalle diario — {SIM_DRIVERS[activeDriver].name}
          </h4>
          <span className="text-xs text-slate-400">15 días · {SIM_DAYS[0]} → {SIM_DAYS[14]}</span>
        </div>
        <div className="p-4">
          <DailyTable driverId={activeDriver} />
        </div>
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────
export default function SimulationPage() {
  const [tab, setTab]           = useState('despacho')
  const [activeDriver, setActiveDriver] = useState(DRIVER_IDS[0])

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-polar-800 to-polar-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-polar-200 text-sm font-mono uppercase tracking-widest mb-1">
              Simulacro de Ciclo Completo
            </p>
            <h1 className="text-3xl font-black">{SIM_LABEL}</h1>
            <p className="text-polar-200 mt-1">
              2 choferes · 15 días · 3 productos · cruce quincenal por peso
            </p>
          </div>
          <div className="text-right text-polar-200 text-sm hidden md:block">
            <p>Tolerancias:</p>
            <p className="text-green-400 font-semibold">±3% Verde</p>
            <p className="text-yellow-400 font-semibold">±5% Amarillo</p>
            <p className="text-red-400 font-semibold">&gt;5% Rojo</p>
          </div>
        </div>

        {/* Resumen rápido de choferes */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {DRIVER_IDS.map(id => {
            const d = SIM_DRIVERS[id]
            const disp = SIM_DISPATCHES[id]
            return (
              <div key={id} className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-polar-200 text-xs">{d.code}</span>
                  <p className="font-bold">{d.name}</p>
                  <p className="text-polar-200 text-xs">{d.route}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black tabular-nums">{(disp.totalG / 1000).toFixed(2)} kg</p>
                  <p className="text-polar-200 text-xs">despachado</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-white text-polar-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.id === 'despacho'  && '📦 '}
            {t.id === 'diario'    && '📊 '}
            {t.id === 'quincena'  && '⚖️ '}
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido del tab */}
      {tab === 'despacho' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-6 h-6 bg-polar-100 text-polar-700 rounded-full text-xs font-bold flex items-center justify-center">1</span>
            <p className="text-sm">El día 1 (01 May 2026) se despachan las siguientes cajas a cada chofer:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DRIVER_IDS.map(id => <DispatchCard key={id} driverId={id} />)}
          </div>
        </div>
      )}

      {tab === 'diario' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-6 h-6 bg-polar-100 text-polar-700 rounded-full text-xs font-bold flex items-center justify-center">2</span>
            <p className="text-sm">Cada chofer reporta unidades vendidas diariamente (Días 1–15):</p>
          </div>
          <DailySection activeDriver={activeDriver} setActiveDriver={setActiveDriver} />
        </div>
      )}

      {tab === 'quincena' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-6 h-6 bg-polar-100 text-polar-700 rounded-full text-xs font-bold flex items-center justify-center">3</span>
            <p className="text-sm">Al cierre del día 15, el sistema cruza peso despachado vs. peso reportado:</p>
          </div>
          <BiweeklyResult />
        </div>
      )}
    </div>
  )
}
