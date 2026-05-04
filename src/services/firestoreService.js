import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, onSnapshot,
  serverTimestamp, getDocs, setDoc,
} from 'firebase/firestore'
import { db } from './firebase.js'

// ── Nombres de colecciones ────────────────────────────────────────
export const COLS = {
  despacho:  'despacho',
  choferes:  'choferes',
  sobrantes: 'sobrantes',
  vueltas:   'vueltas',
}

// ─────────────────────────────────────────────────────────────────
//  COLECCIÓN: choferes
// ─────────────────────────────────────────────────────────────────

// Lectura en tiempo real (para selects / hooks de chofer)
export function subscribeChoferes(callback) {
  const q = query(collection(db, COLS.choferes), orderBy('nombre', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ _id: d.id, ...d.data() })))
  }, () => callback([]))
}

// Admin: crear perfil de chofer
export async function createChofer({ ficha, nombre, ruta, codigo }) {
  return await setDoc(doc(db, COLS.choferes, ficha), {
    ficha, nombre, ruta, codigo,
    status:      'activo',
    createdAt:   serverTimestamp(),
    bajadoAt:    null,
    bajaNota:    null,
    reactivadoAt: null,
    source:      'polar-breeze-weight',
  })
}

// Admin: editar perfil
export async function updateChofer(fichaId, data) {
  await updateDoc(doc(db, COLS.choferes, fichaId), { ...data, updatedAt: serverTimestamp() })
}

// Admin: dar de baja (historial intacto)
export async function bajaChofer(fichaId, nota = '') {
  await updateDoc(doc(db, COLS.choferes, fichaId), {
    status:   'baja',
    bajadoAt: serverTimestamp(),
    bajaNota: nota,
  })
}

// Admin: reactivar chofer
export async function reactivarChofer(fichaId) {
  await updateDoc(doc(db, COLS.choferes, fichaId), {
    status:       'activo',
    reactivadoAt: serverTimestamp(),
    bajadoAt:     null,
    bajaNota:     null,
  })
}

// Stats por chofer: agregación de despacho, vueltas, sobrantes
export async function getDriverStats(driverId, period) {
  const [despSnap, vueltSnap, sobSnap] = await Promise.all([
    getDocs(query(collection(db, COLS.despacho),  where('driverId','==',driverId), where('period','==',period))),
    getDocs(query(collection(db, COLS.vueltas),   where('driverId','==',driverId), where('period','==',period))),
    getDocs(query(collection(db, COLS.sobrantes), where('driverId','==',driverId), where('period','==',period))),
  ])

  const despachos  = despSnap.docs.map(d  => ({ _id: d.id,  ...d.data() }))
  const vueltas    = vueltSnap.docs.map(d => ({ _id: d.id,  ...d.data() }))
  const sobrantes  = sobSnap.docs.map(d  => ({ _id: d.id,  ...d.data() }))

  const byProduct  = {}
  let totalBoxes = 0, totalUnits = 0, totalWeightG = 0

  for (const d of despachos) {
    totalBoxes   += d.totalBoxes   ?? 0
    totalUnits   += d.totalUnits   ?? 0
    totalWeightG += d.totalWeightG ?? 0
    for (const it of (d.items ?? [])) {
      const pid = it.productId
      if (!byProduct[pid]) byProduct[pid] = { productId: pid, productName: it.productName ?? pid, boxes: 0, units: 0, totalG: 0 }
      byProduct[pid].boxes  += it.boxes  ?? 0
      byProduct[pid].units  += it.units  ?? 0
      byProduct[pid].totalG += it.totalG ?? 0
    }
  }

  const totalVendidoG   = vueltas.reduce((s, v) => s + (v.totalVendidoG ?? 0), 0)
  const totalRetornadoG = sobrantes.reduce((s, r) => s + (r.totalWeightG ?? 0), 0)
  const lastVuelta      = vueltas.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))[0] ?? null

  return {
    driverId, period,
    totalBoxes, totalUnits, totalWeightG,
    totalVendidoG, totalRetornadoG,
    byProduct: Object.values(byProduct),
    vueltas, sobrantes,
    lastVuelta,
  }
}

// ─────────────────────────────────────────────────────────────────
//  COLECCIÓN: despacho
// ─────────────────────────────────────────────────────────────────
// Esquema documento:
// {
//   driverId, driverName, date, period,
//   items: [{ productId, productName, boxes, units, unitG, boxG, totalG }],
//   totalBoxes, totalUnits, totalWeightG,
//   syncedToSheets: false,
//   createdAt: Timestamp
// }

export async function saveDespacho(data) {
  const ref = await addDoc(collection(db, COLS.despacho), {
    ...data,
    syncedToSheets: false,
    createdAt:      serverTimestamp(),
  })
  return ref.id
}

export function subscribeDespachos(period, callback) {
  const q = query(
    collection(db, COLS.despacho),
    where('period', '==', period),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ _id: d.id, ...d.data() })))
  })
}

export async function getDespachosByDriver(driverId, period) {
  const q = query(
    collection(db, COLS.despacho),
    where('driverId', '==', driverId),
    where('period',   '==', period),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
}

export async function markDespachoSynced(id) {
  await updateDoc(doc(db, COLS.despacho, id), { syncedToSheets: true })
}

// ─────────────────────────────────────────────────────────────────
//  COLECCIÓN: sobrantes
// ─────────────────────────────────────────────────────────────────
// Esquema documento:
// {
//   driverId, driverName, date, period, hora,
//   despachoId (referencia al despacho origen),
//   items: [{ productId, productName, unidades, weightG }],
//   totalWeightG, notas,
//   syncedToSheets: false,
//   createdAt: Timestamp
// }

export async function saveSobrante(data) {
  const ref = await addDoc(collection(db, COLS.sobrantes), {
    ...data,
    syncedToSheets: false,
    createdAt:      serverTimestamp(),
  })
  return ref.id
}

export function subscribeSobrantes(period, callback) {
  const q = query(
    collection(db, COLS.sobrantes),
    where('period', '==', period),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ _id: d.id, ...d.data() })))
  })
}

export async function markSobranteSynced(id) {
  await updateDoc(doc(db, COLS.sobrantes, id), { syncedToSheets: true })
}

// ─────────────────────────────────────────────────────────────────
//  COLECCIÓN: vueltas
// ─────────────────────────────────────────────────────────────────
// Esquema documento (ficha del chofer):
// {
//   fichaNumero,
//   driverId, driverName, route, date, period, hora,
//   items: [{
//     productId, productName,
//     despachadas, retornadas, vendidas,
//     pesoDespachadoG, pesoRetornadoG, pesoVendidoG
//   }],
//   totalDespachadoG, totalRetornadoG, totalVendidoG,
//   diffG, pctDiff, status,  // cruce peso
//   observaciones,
//   syncedToSheets: false,
//   createdAt: Timestamp
// }

export async function saveVuelta(data) {
  const ref = await addDoc(collection(db, COLS.vueltas), {
    ...data,
    syncedToSheets: false,
    createdAt:      serverTimestamp(),
  })
  return ref.id
}

export function subscribeVueltas(period, callback) {
  const q = query(
    collection(db, COLS.vueltas),
    where('period', '==', period),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ _id: d.id, ...d.data() })))
  })
}

export async function markVueltaSynced(id) {
  await updateDoc(doc(db, COLS.vueltas, id), { syncedToSheets: true })
}

// ─────────────────────────────────────────────────────────────────
//  Pendientes de sincronización con Sheets
// ─────────────────────────────────────────────────────────────────

export async function getPendingSync(colName) {
  const q = query(
    collection(db, colName),
    where('syncedToSheets', '==', false),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
}
