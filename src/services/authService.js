import {
  doc, getDoc, setDoc, getDocs,
  collection, query, where, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase.js'

const SALT = 'pbw-polar-2026'

// ── Hashing con Web Crypto API (SHA-256) ──────────────────────────
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data    = encoder.encode(password + SALT)
  const buf     = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── Chofer lookup por ficha ───────────────────────────────────────
async function getChoferByFicha(ficha) {
  const q    = query(collection(db, 'choferes'), where('ficha', '==', ficha))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { _id: snap.docs[0].id, ref: snap.docs[0].ref, ...snap.docs[0].data() }
}

// ── LOGIN CHOFER ──────────────────────────────────────────────────
export async function loginChofer(ficha, password) {
  const chofer = await getChoferByFicha(ficha)
  if (!chofer) throw new Error('Ficha no encontrada. Contacta al administrador.')

  if (chofer.status === 'baja')      throw new Error('Tu acceso ha sido suspendido. Contacta al administrador.')
  if (chofer.status === 'pendiente') throw new Error('Aún no te has registrado. Ve a "Primer Acceso".')

  const hash = await hashPassword(password)
  if (chofer.passwordHash !== hash)  throw new Error('Contraseña incorrecta.')

  return {
    role:   'chofer',
    id:     chofer._id,
    ficha:  chofer.ficha,
    nombre: chofer.nombre ?? chofer.name ?? ficha,
    route:  chofer.ruta   ?? chofer.route ?? '',
  }
}

// ── REGISTRO CHOFER (solo UNA vez) ───────────────────────────────
export async function lookupFichaForRegister(ficha) {
  const chofer = await getChoferByFicha(ficha)
  if (!chofer) throw new Error('Ficha no encontrada. El administrador debe crearte primero.')

  if (chofer.status === 'activo') {
    const err = new Error('Ya estás registrado. Inicia sesión normalmente.')
    err.code = 'ALREADY_REGISTERED'
    throw err
  }
  if (chofer.status === 'baja') {
    const err = new Error('Tu acceso ha sido suspendido. Contacta al administrador.')
    err.code = 'SUSPENDED'
    throw err
  }

  return { _id: chofer._id, ref: chofer.ref, nombre: chofer.nombre ?? chofer.name, ficha }
}

export async function registerChofer(fichaRef, fichaId, nombre, password) {
  const hash = await hashPassword(password)
  await updateDoc(fichaRef, {
    passwordHash:  hash,
    status:        'activo',
    registradoAt:  serverTimestamp(),
  })
  return { role: 'chofer', id: fichaId, ficha: fichaId, nombre }
}

// ── LOGIN ADMIN ───────────────────────────────────────────────────
const ADMIN_DEFAULT = 'admin1234'   // cambiar desde el panel Admin

export async function loginAdmin(password) {
  const adminDoc = await getDoc(doc(db, 'config', 'admin'))

  if (!adminDoc.exists()) {
    // Primera vez: crear config con contraseña por defecto
    if (password !== ADMIN_DEFAULT) throw new Error('Contraseña admin incorrecta.')
    const hash = await hashPassword(password)
    await setDoc(doc(db, 'config', 'admin'), {
      passwordHash: hash,
      nombre:       'Administrador',
      createdAt:    serverTimestamp(),
    })
    return { role: 'admin', id: 'admin', nombre: 'Administrador' }
  }

  const hash = await hashPassword(password)
  if (adminDoc.data().passwordHash !== hash) throw new Error('Contraseña admin incorrecta.')

  return { role: 'admin', id: 'admin', nombre: adminDoc.data().nombre ?? 'Administrador' }
}

export async function changeAdminPassword(newPassword) {
  const hash = await hashPassword(newPassword)
  await setDoc(doc(db, 'config', 'admin'), { passwordHash: hash }, { merge: true })
}

// ── ADMIN: Cambiar contraseña de chofer ───────────────────────────
export async function changeChoferPassword(choferDocId, newPassword) {
  const hash = await hashPassword(newPassword)
  await updateDoc(doc(db, 'choferes', choferDocId), { passwordHash: hash })
}
