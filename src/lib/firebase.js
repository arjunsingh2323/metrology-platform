import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyB6KT0SdgNrkp_omlE7uvI4qsqRkKfzSfo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "measurement-63482.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "measurement-63482",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "measurement-63482.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "927628852592",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:927628852592:web:df0894640c5433e66623b5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-0TXWEN0L2B",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? "https://measurement-63482-default-rtdb.asia-southeast1.firebasedatabase.app"
};

console.log('[Firebase] Initializing with projectId:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
