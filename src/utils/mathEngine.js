import { getProductById } from '../data/products.js'

// ─── Cálculo de peso por despacho ────────────────────────────────────────────

export function calcDispatchWeight(items) {
  // items: [{ productId, boxes }]
  return items.reduce((total, item) => {
    const product = getProductById(item.productId)
    if (!product) return total
    return total + product.weightPerBox * item.boxes
  }, 0)
}

// ─── Cálculo de peso vendido por reportes diarios ────────────────────────────

export function calcSoldWeight(reports) {
  // reports: [{ productId, unitsSold }]
  return reports.reduce((total, r) => {
    const product = getProductById(r.productId)
    if (!product) return total
    return total + product.weightPerUnit * r.unitsSold
  }, 0)
}

// ─── Motor de acumulación quincenal ──────────────────────────────────────────

export function accumulateDailyReports(dailyReports) {
  // dailyReports: [{ driverId, date, reports: [{ productId, unitsSold }] }]
  const byDriver = {}
  for (const day of dailyReports) {
    if (!byDriver[day.driverId]) byDriver[day.driverId] = {}
    for (const r of day.reports) {
      byDriver[day.driverId][r.productId] =
        (byDriver[day.driverId][r.productId] || 0) + r.unitsSold
    }
  }
  return byDriver
}

// ─── Cruce quincenal ─────────────────────────────────────────────────────────

export const TOLERANCE = { green: 0.03, yellow: 0.05 }

export function getBiweeklyStatus(dispatchedGrams, reportedGrams) {
  if (dispatchedGrams === 0) return { status: 'sin-datos', diff: 0, pct: 0 }
  const diff = dispatchedGrams - reportedGrams
  const pct  = diff / dispatchedGrams          // positive = faltante, negative = sobrante

  let status
  const abs = Math.abs(pct)
  if (abs <= TOLERANCE.green)       status = 'verde'
  else if (abs <= TOLERANCE.yellow) status = 'amarillo'
  else                               status = 'rojo'

  return { status, diff, pct }
}

export function buildBiweeklyReport(dispatches, dailyReports) {
  // dispatches:   [{ driverId, items: [{ productId, boxes }] }]
  // dailyReports: [{ driverId, date, reports: [{ productId, unitsSold }] }]

  const accumulated = accumulateDailyReports(dailyReports)

  return dispatches.map(dispatch => {
    const dispatchedGrams = calcDispatchWeight(dispatch.items)

    const driverAccum = accumulated[dispatch.driverId] || {}
    const reportedGrams = Object.entries(driverAccum).reduce((sum, [productId, units]) => {
      const product = getProductById(productId)
      return product ? sum + product.weightPerUnit * units : sum
    }, 0)

    const { status, diff, pct } = getBiweeklyStatus(dispatchedGrams, reportedGrams)

    return {
      driverId:       dispatch.driverId,
      dispatchedGrams,
      reportedGrams,
      diffGrams:      diff,
      pctDiff:        pct,
      status,
    }
  })
}

// ─── Helpers de formato ───────────────────────────────────────────────────────

export const fmtGrams  = (g) => g >= 1000 ? `${(g / 1000).toFixed(3)} kg` : `${g} g`
export const fmtPct    = (p) => `${(p * 100).toFixed(2)}%`
