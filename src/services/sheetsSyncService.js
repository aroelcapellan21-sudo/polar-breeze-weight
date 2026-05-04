// Sincronización Firestore → Google Sheets (respaldo secundario)
// No bloquea la UI — fallos silenciosos con reintento automático
import { isSignedIn } from './sheetsService.js'
import { markDespachoSynced, markSobranteSynced, markVueltaSynced } from './firestoreService.js'

// Colas locales de reintento
const queue = { despacho: [], sobrantes: [], vueltas: [] }

// ── Helpers ───────────────────────────────────────────────────────
async function appendToSheet(sheetName, rows) {
  if (!isSignedIn()) return false
  try {
    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId:    import.meta.env.VITE_SPREADSHEET_ID,
      range:            `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: rows },
    })
    return true
  } catch {
    return false
  }
}

// ── Despacho → Hoja "Despachos" ──────────────────────────────────
// Columnas: Fecha | Período | ChoferID | Chofer | ProductoID | Producto | Cajas | Unidades | PesoG | PesoKg
export async function syncDespachoToSheets(doc) {
  const rows = doc.items.map(it => [
    doc.date, doc.period, doc.driverId, doc.driverName,
    it.productId, it.productName,
    it.boxes, it.units,
    it.totalG, (it.totalG / 1000).toFixed(3),
  ])
  const ok = await appendToSheet('Despachos', rows)
  if (ok && doc._id) await markDespachoSynced(doc._id)
  else if (doc._id) queue.despacho.push(doc)
  return ok
}

// ── Sobrantes → Hoja "Sobrantes" ─────────────────────────────────
// Columnas: Fecha | Período | ChoferID | Chofer | ProductoID | Producto | Unidades | PesoG | Notas
export async function syncSobranteToSheets(doc) {
  const rows = doc.items.map(it => [
    doc.date, doc.period, doc.driverId, doc.driverName,
    it.productId, it.productName,
    it.unidades, it.weightG,
    doc.notas || '',
  ])
  const ok = await appendToSheet('Sobrantes', rows)
  if (ok && doc._id) await markSobranteSynced(doc._id)
  else if (doc._id) queue.sobrantes.push(doc)
  return ok
}

// ── Vueltas → Hoja "Vueltas" ─────────────────────────────────────
// Columnas: Ficha | Fecha | Período | Hora | ChoferID | Chofer | Ruta |
//           ProductoID | Producto | Desp. | Retorn. | Vendido |
//           PesoDesp.G | PesoRet.G | PesoVend.G | %Diff | Estado
export async function syncVueltaToSheets(doc) {
  const rows = doc.items.map(it => [
    doc.fichaNumero, doc.date, doc.period, doc.hora,
    doc.driverId, doc.driverName, doc.route,
    it.productId, it.productName,
    it.despachadas, it.retornadas, it.vendidas,
    it.pesoDespachadoG, it.pesoRetornadoG, it.pesoVendidoG,
    (doc.pctDiff * 100).toFixed(2), doc.status,
  ])
  const ok = await appendToSheet('Vueltas', rows)
  if (ok && doc._id) await markVueltaSynced(doc._id)
  else if (doc._id) queue.vueltas.push(doc)
  return ok
}

// ── Reintentar pendientes (llamar cuando Sheets vuelva a estar conectado) ──
export async function flushPendingSync() {
  const retryDespachos  = [...queue.despacho];  queue.despacho  = []
  const retrySobrantes  = [...queue.sobrantes]; queue.sobrantes = []
  const retryVueltas    = [...queue.vueltas];   queue.vueltas   = []

  await Promise.allSettled([
    ...retryDespachos.map(syncDespachoToSheets),
    ...retrySobrantes.map(syncSobranteToSheets),
    ...retryVueltas.map(syncVueltaToSheets),
  ])
}
