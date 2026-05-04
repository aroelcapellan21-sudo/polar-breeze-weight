import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  enableIndexedDbPersistence,
} from 'firebase/firestore'

// Configuración Firebase — Polar Breeze / SPIKINSCAN compartido
const firebaseConfig = {
  apiKey:            'AIzaSyDff-CX-65-ruH8YIUeJ08dE0B6Ad8AcCk',
  authDomain:        'polar-breeze.firebaseapp.com',
  projectId:         'polar-breeze',
  storageBucket:     'polar-breeze.firebasestorage.app',
  messagingSenderId: '318761541153',
  appId:             '1:318761541153:web:3537c3f89767084ab30d60',
}

// Evita re-inicializar si ya existe (hot-reload de Vite)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db  = getFirestore(app)

// Persistencia offline — datos disponibles sin internet
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('Firebase offline: múltiples pestañas abiertas')
  } else if (err.code === 'unimplemented') {
    console.warn('Firebase offline: navegador no soportado')
  }
})

export default app
