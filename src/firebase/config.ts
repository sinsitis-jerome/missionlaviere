import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const missingFirebaseConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

// Si la configuration est incomplète (première installation, avant que
// .env.local soit renseigné), on évite de laisser le SDK Firebase lever une
// exception au chargement du module : l'écran d'accueil affiche alors un
// message explicite plutôt qu'une page blanche.
const isConfigured = missingFirebaseConfig.length === 0;

export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();

/** À utiliser dans le code qui ne s'exécute qu'une fois Firebase configuré. */
export function requireDb() {
  if (!db) throw new Error("Firebase n'est pas configuré.");
  return db;
}
