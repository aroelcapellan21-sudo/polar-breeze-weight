// ═══════════════════════════════════════════════════════════════
//  SIMULACRO QUINCENAL — 1ra Quincena Mayo 2026  (Días 1-15)
//  Chofer #0042 Juan Pérez   →  cuadra ✅  (~2.45%)
//  Chofer #0078 Carlos Marte →  alerta 🚨  (~6.31%)
// ═══════════════════════════════════════════════════════════════

export const SIM_PERIOD  = '2026-05-Q1'
export const SIM_LABEL   = '1ra Quincena Mayo 2026'
export const SIM_DAYS    = Array.from({ length: 15 }, (_, i) => {
  const d = new Date('2026-05-01')
  d.setDate(d.getDate() + i)
  return d.toISOString().slice(0, 10)
})

// ── Choferes ────────────────────────────────────────────────────
export const SIM_DRIVERS = {
  'CH-42': { id: 'CH-42', code: '#0042', name: 'Juan Pérez',   route: 'Ruta Nororiente' },
  'CH-78': { id: 'CH-78', code: '#0078', name: 'Carlos Marte', route: 'Ruta Sur-Centro' },
}

// ── Productos usados ─────────────────────────────────────────────
//  PB-001 Paleta Vainilla  85 g/ud · 24 ud/caja · 2 040 g/caja
//  PB-007 Copa Chocolate  125 g/ud · 12 ud/caja · 1 500 g/caja
//  PB-010 Barquillo Doble 185 g/ud · 12 ud/caja · 2 220 g/caja

export const SIM_PRODUCTS = {
  'PB-001': { name: 'Paleta Vainilla',  unitG: 85,  boxG: 2040, unitsBox: 24, color: '#60a5fa' },
  'PB-007': { name: 'Copa Chocolate',   unitG: 125, boxG: 1500, unitsBox: 12, color: '#a78bfa' },
  'PB-010': { name: 'Barquillo Doble',  unitG: 185, boxG: 2220, unitsBox: 12, color: '#fb923c' },
}

// ── Despacho Día 1 ───────────────────────────────────────────────
export const SIM_DISPATCHES = {
  'CH-42': {
    items: [
      { productId: 'PB-001', boxes: 2, units: 48,  boxG: 2040, totalG: 4080 },
      { productId: 'PB-007', boxes: 3, units: 36,  boxG: 1500, totalG: 4500 },
    ],
    totalG: 8580,                          // 4 080 + 4 500
  },
  'CH-78': {
    items: [
      { productId: 'PB-001', boxes: 4, units: 96,  boxG: 2040, totalG: 8160 },
      { productId: 'PB-010', boxes: 2, units: 24,  boxG: 2220, totalG: 4440 },
    ],
    totalG: 12600,                         // 8 160 + 4 440
  },
}

// ── Reportes diarios: unidades vendidas por día ──────────────────
//  Juan (#0042)
//  Paleta: [3,3,3,3,3,3,3,4,3,3,3,3,3,3,4]  Σ=47 → 47×85=3 995 g
//  Copa:   [2,2,3,2,2,3,2,2,2,3,2,2,3,2,3]  Σ=35 → 35×125=4 375 g
//  Reportado: 8 370 g  |  Despachado: 8 580 g  |  Δ=210 g = 2.45% VERDE

//  Carlos (#0078)
//  Paleta:    [6,6,6,6,6,6,6,7,6,6,6,6,6,6,6]  Σ=91 → 91×85=7 735 g
//  Barquillo: [2,2,2,2,2,1,2,1,1,2,1,1,1,1,1]  Σ=22 → 22×185=4 070 g
//  Reportado: 11 805 g  |  Despachado: 12 600 g  |  Δ=795 g = 6.31% ROJO

const RAW = {
  'CH-42': {
    'PB-001': [3,3,3,3,3,3,3,4,3,3,3,3,3,3,4],
    'PB-007': [2,2,3,2,2,3,2,2,2,3,2,2,3,2,3],
  },
  'CH-78': {
    'PB-001': [6,6,6,6,6,6,6,7,6,6,6,6,6,6,6],
    'PB-010': [2,2,2,2,2,1,2,1,1,2,1,1,1,1,1],
  },
}

// ── Reportes construidos ─────────────────────────────────────────
export const SIM_DAILY_REPORTS = Object.fromEntries(
  Object.entries(RAW).map(([driverId, byProduct]) => {
    const productIds = Object.keys(byProduct)
    const reports = SIM_DAYS.map((date, i) => {
      const entries = productIds.map(pid => {
        const units = byProduct[pid][i]
        return { productId: pid, unitsSold: units, weightG: units * SIM_PRODUCTS[pid].unitG }
      })
      return {
        date,
        entries,
        totalWeightG: entries.reduce((s, e) => s + e.weightG, 0),
      }
    })
    return [driverId, reports]
  })
)

// ── Datos para gráfica diaria (unidades + peso diario) ───────────
export function buildDailyChartData(driverId) {
  const reports = SIM_DAILY_REPORTS[driverId]
  return reports.map((r, i) => {
    const row = { day: `D${i + 1}`, date: r.date, totalG: r.totalWeightG }
    for (const e of r.entries) {
      row[e.productId] = e.unitsSold
    }
    return row
  })
}

// ── Datos para gráfica acumulada ─────────────────────────────────
export function buildCumulativeChartData(driverId) {
  const dispatch = SIM_DISPATCHES[driverId]
  const limitKg  = +(dispatch.totalG / 1000).toFixed(3)
  let cum = 0
  return SIM_DAILY_REPORTS[driverId].map((r, i) => {
    cum += r.totalWeightG
    return {
      day:    `D${i + 1}`,
      date:   r.date,
      cumKg:  +(cum / 1000).toFixed(3),
      dailyKg: +(r.totalWeightG / 1000).toFixed(3),
      limitKg,
    }
  })
}

// ── Cruce quincenal ──────────────────────────────────────────────
export function buildSimBiweekly() {
  return Object.entries(SIM_DAILY_REPORTS).map(([driverId, reports]) => {
    const driver     = SIM_DRIVERS[driverId]
    const dispatch   = SIM_DISPATCHES[driverId]
    const reportedG  = reports.reduce((s, r) => s + r.totalWeightG, 0)
    const diffG      = dispatch.totalG - reportedG
    const pct        = diffG / dispatch.totalG
    const absPct     = Math.abs(pct)
    const status     = absPct <= 0.03 ? 'verde' : absPct <= 0.05 ? 'amarillo' : 'rojo'

    // Per-product breakdown
    const byProduct = {}
    for (const r of reports) {
      for (const e of r.entries) {
        byProduct[e.productId] = (byProduct[e.productId] || 0) + e.unitsSold
      }
    }

    return { driver, dispatchedG: dispatch.totalG, reportedG, diffG, pct, absPct, status, byProduct }
  })
}
