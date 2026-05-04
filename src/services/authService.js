import {
  doc, getDoc, setDoc, updateDoc,
} from 'firebase/firestore'
import { db } from './firebase.js'

const SALT = 'pbw-polar-2026'

// ── Hash SHA-256 ──────────────────────────────────────────────────
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data    = encoder.encode(password + SALT)
  const buf     = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── LOGIN ADMIN ───────────────────────────────────────────────────
const ADMIN_DEFAULT = 'admin1234'

export async function loginAdmin(password) {
  const adminDoc = await getDoc(doc(db, 'config', 'admin'))

  if (!adminDoc.exists()) {
    // Primera vez — inicializa con la contraseña por defecto
    if (password !== ADMIN_DEFAULT) throw new Error('Contraseña incorrecta.')
    const hash = await hashPassword(password)
    await setDoc(doc(db, 'config', 'admin'), {
      passwordHash: hash,
      nombre:       'Administrador',
    })
    return { role: 'admin', id: 'admin', nombre: 'Administrador' }
  }

  const hash = await hashPassword(password)
  if (adminDoc.data().passwordHash !== hash) throw new Error('Contraseña incorrecta.')

  return { role: 'admin', id: 'admin', nombre: adminDoc.data().nombre ?? 'Administrador' }
}

// ── CAMBIAR CONTRASEÑA ADMIN ──────────────────────────────────────
export async function changeAdminPassword(newPassword) {
  const hash = await hashPassword(newPassword)
  await setDoc(doc(db, 'config', 'admin'), { passwordHash: hash }, { merge: true })
}
