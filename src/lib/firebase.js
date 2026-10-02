import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoApiKeyForLocalDevelopment123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "metrik-sih-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "metrik-sih-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "metrik-sih-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://metrik-sih-demo-default-rtdb.firebaseio.com"
};

console.log('[Firebase] Initializing with projectId:', firebaseConfig.projectId);

let app;
let db;
let auth;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (err) {
  console.warn('[Firebase] Initialization warning:', err.message);
}

export { db, auth, storage };
export default app;
