import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

export const registerUser = async (email, password, role, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store user profile in Realtime Database under /users/{uid}
    await set(ref(db, `users/${user.uid}`), {
      uid: user.uid,
      email: user.email,
      name,
      role,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message };
  }
};

// Default demo Inspector user for instant previewing
const DEFAULT_DEMO_USER = { uid: 'demo-inspector-uid', email: 'inspector.mysuru@metrology.gov.in' };
const DEFAULT_DEMO_PROFILE = {
  uid: 'demo-inspector-uid',
  name: 'Rajesh Kumar',
  email: 'inspector.mysuru@metrology.gov.in',
  role: 'INSPECTOR',
  district: 'Mysuru',
  state: 'Karnataka'
};

let mockSessionUser = DEFAULT_DEMO_USER;
let mockSessionProfile = DEFAULT_DEMO_PROFILE;
const listeners = [];

export const loginUser = async (email, password) => {
  try {
    if (auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      let profile = null;
      try {
        const snapshot = await get(ref(db, `users/${userCredential.user.uid}`));
        profile = snapshot.exists() ? snapshot.val() : null;
      } catch (dbErr) {
        console.warn("Could not fetch profile from DB:", dbErr.message);
      }
      mockSessionUser = userCredential.user;
      mockSessionProfile = profile || { ...DEFAULT_DEMO_PROFILE, email: userCredential.user.email, name: email.split('@')[0] };
      listeners.forEach(cb => cb(mockSessionUser, mockSessionProfile));
      return { success: true, user: mockSessionUser, profile: mockSessionProfile };
    }
  } catch (error) {
    console.warn("Firebase Auth error, using demo Inspector session:", error.message);
  }

  // Demo Inspector session fallback
  mockSessionUser = { uid: 'demo-inspector-uid', email: email || DEFAULT_DEMO_USER.email };
  mockSessionProfile = {
    ...DEFAULT_DEMO_PROFILE,
    name: email ? email.split('@')[0] : 'Rajesh Kumar',
    email: email || DEFAULT_DEMO_USER.email
  };

  listeners.forEach(cb => cb(mockSessionUser, mockSessionProfile));
  return { success: true, user: mockSessionUser, profile: mockSessionProfile };
};

export const setSessionProfile = (user, profile) => {
  mockSessionUser = user;
  mockSessionProfile = profile;
  listeners.forEach(cb => cb(mockSessionUser, mockSessionProfile));
};

export const logoutUser = async () => {
  mockSessionUser = null;
  mockSessionProfile = null;
  listeners.forEach(cb => cb(null, null));
  try {
    if (auth) await signOut(auth);
  } catch (e) {
    // Ignore sign out error in demo mode
  }
};

export const subscribeToAuthChanges = (callback) => {
  listeners.push(callback);

  // Immediately notify listener with current session (defaults to demo inspector)
  callback(mockSessionUser, mockSessionProfile);

  let unsubscribe = () => {};

  try {
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          let profile = null;
          try {
            const snapshot = await get(ref(db, `users/${user.uid}`));
            profile = snapshot.exists() ? snapshot.val() : null;
          } catch (e) {
            console.warn("Could not load profile:", e.message);
          }
          mockSessionUser = user;
          mockSessionProfile = profile || { ...DEFAULT_DEMO_PROFILE, email: user.email };
          callback(mockSessionUser, mockSessionProfile);
        } else if (!mockSessionUser) {
          // If explicitly signed out, trigger null
          callback(null, null);
        }
      });
    }
  } catch (err) {
    console.warn("Auth state subscription error:", err.message);
    callback(mockSessionUser, mockSessionProfile);
  }

  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
    if (typeof unsubscribe === 'function') unsubscribe();
  };
};
