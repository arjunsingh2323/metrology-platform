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

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    let profile = null;
    try {
      const snapshot = await get(ref(db, `users/${userCredential.user.uid}`));
      profile = snapshot.exists() ? snapshot.val() : null;
    } catch (dbErr) {
      console.warn("Could not fetch profile from DB:", dbErr.message);
    }
    
    return { success: true, user: userCredential.user, profile };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      let profile = null;
      try {
        const snapshot = await get(ref(db, `users/${user.uid}`));
        profile = snapshot.exists() ? snapshot.val() : null;
      } catch (e) {
        console.warn("Could not load profile:", e.message);
      }
      callback(user, profile);
    } else {
      callback(null, null);
    }
  });
};
