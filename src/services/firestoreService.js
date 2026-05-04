import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, onSnapshot,
  serverTimestamp, getDocs,
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
//  COLECCIÓN: choferes  (ya existe en Firebase — solo lectura)
// ─────────────────────────────────────────────────────────────────

export function subscribeChoferes(callback) {
  const q = query(collection(db, COLS.choferes), orderBy('nombre', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ _id: d.id, ...d.data() })))
  }, () => callback([]))    // en caso de error de permisos devuelve vacío
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
