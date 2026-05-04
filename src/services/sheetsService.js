// Google Sheets API service — igual que SPIKINSCAN
// Usa la Sheets API v4 con OAuth2 para lectura/escritura

const API_KEY      = import.meta.env.VITE_GOOGLE_API_KEY
const CLIENT_ID    = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SPREADSHEET  = import.meta.env.VITE_SPREADSHEET_ID

const SHEETS = {
  products:     import.meta.env.VITE_SHEET_PRODUCTS      || 'Productos',
  drivers:      import.meta.env.VITE_SHEET_DRIVERS       || 'Choferes',
  dispatches:   import.meta.env.VITE_SHEET_DISPATCHES    || 'Despachos',
  dailyReports: import.meta.env.VITE_SHEET_DAILY_REPORTS || 'ReportesDiarios',
  biweekly:     import.meta.env.VITE_SHEET_BIWEEKLY      || 'QuincenaCruce',
}

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const DISCOVERY = 'https://sheets.googleapis.com/$discovery/rest?version=v4'

let gapiReady = false
let tokenClient = null

// ─── Inicialización ──────────────────────────────────────────────────────────

export async function initSheets() {
  await loadGapi()
  await loadGis()
  gapiReady = true
}

function loadGapi() {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://apis.google.com/js/api.js'
    s.onload = async () => {
      await new Promise(r => window.gapi.load('client', r))
      await window.gapi.client.init({
        apiKey:          API_KEY,
        discoveryDocs:   [DISCOVERY],
      })
      resolve()
    }
    s.onerror = reject
    document.head.appendChild(s)
  })
}

function loadGis() {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope:     SCOPE,
        callback:  () => {},
      })
      resolve()
    }
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export function signIn() {
  return new Promise((resolve) => {
    tokenClient.callback = resolve
    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

export function signOut() {
  const token = window.gapi.client.getToken()
  if (token) window.google.accounts.oauth2.revoke(token.access_token)
  window.gapi.client.setToken(null)
}

export const isSignedIn = () =>
  gapiReady && !!window.gapi?.client?.getToken()?.access_token

// ─── Helpers internos ────────────────────────────────────────────────────────

async function readRange(range) {
  const res = await window.gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET,
    range,
  })
  return res.result.values || []
}

async function appendRows(sheet, rows) {
  await window.gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId:     SPREADSHEET,
    range:             `${sheet}!A1`,
    valueInputOption:  'USER_ENTERED',
    insertDataOption:  'INSERT_ROWS',
    resource: { values: rows },
  })
}

async function clearAndWrite(sheet, rows) {
  await window.gapi.client.sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET,
    range:         `${sheet}!A:Z`,
  })
  if (rows.length > 0) {
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId:    SPREADSHEET,
      range:            `${sheet}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: rows },
    })
  }
}

// ─── Despachos ───────────────────────────────────────────────────────────────

const DISPATCH_HEADER = [
  'ID', 'Fecha', 'ChoferID', 'ProductoID', 'Cajas', 'PesoTotalG', 'Quincena',
]

export async function saveDispatch(dispatch) {
  // dispatch: { id, date, driverId, items, totalWeightG, period }
  const rows = dispatch.items.map(item => [
    dispatch.id,
    dispatch.date,
    dispatch.driverId,
    item.productId,
    item.boxes,
    item.weightG,
    dispatch.period,
  ])
  await appendRows(SHEETS.dispatches, rows)
}

export async function fetchDispatches(period) {
  const rows = await readRange(`${SHEETS.dispatches}!A:G`)
  const data  = rows.slice(1) // skip header
  return data
    .filter(r => !period || r[6] === period)
    .map(r => ({
      id:          r[0],
      date:        r[1],
      driverId:    r[2],
      productId:   r[3],
      boxes:       Number(r[4]),
      weightG:     Number(r[5]),
      period:      r[6],
    }))
}

// ─── Reportes Diarios ────────────────────────────────────────────────────────

const DAILY_HEADER = [
  'ID', 'Fecha', 'ChoferID', 'ProductoID', 'UnidadesVendidas', 'PesoTotalG', 'Quincena',
]

export async function saveDailyReport(report) {
  // report: { id, date, driverId, entries: [{ productId, unitsSold, weightG }], period }
  const rows = report.entries.map(e => [
    report.id,
    report.date,
    report.driverId,
    e.productId,
    e.unitsSold,
    e.weightG,
    report.period,
  ])
  await appendRows(SHEETS.dailyReports, rows)
}

export async function fetchDailyReports(period) {
  const rows = await readRange(`${SHEETS.dailyReports}!A:G`)
  const data  = rows.slice(1)
  return data
    .filter(r => !period || r[6] === period)
    .map(r => ({
      id:          r[0],
      date:        r[1],
      driverId:    r[2],
      productId:   r[3],
      unitsSold:   Number(r[4]),
      weightG:     Number(r[5]),
      period:      r[6],
    }))
}

// ─── Cruce Quincenal ─────────────────────────────────────────────────────────

export async function saveBiweeklyReport(period, rows) {
  const header = [
    'Quincena', 'ChoferID', 'DespachadoG', 'ReportadoG', 'DiferenciaG', '%Diferencia', 'Estado',
  ]
  const data = rows.map(r => [
    period,
    r.driverId,
    r.dispatchedGrams,
    r.reportedGrams,
    r.diffGrams,
    (r.pctDiff * 100).toFixed(2),
    r.status,
  ])
  await appendRows(SHEETS.biweekly, [header, ...data])
}

export async function fetchBiweeklyReports() {
  const rows = await readRange(`${SHEETS.biweekly}!A:G`)
  return rows.slice(1).map(r => ({
    period:         r[0],
    driverId:       r[1],
    dispatchedGrams: Number(r[2]),
    reportedGrams:   Number(r[3]),
    diffGrams:       Number(r[4]),
    pctDiff:         Number(r[5]) / 100,
    status:          r[6],
  }))
}
