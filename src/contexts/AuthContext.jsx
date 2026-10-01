import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges, logoutUser, setSessionProfile } from '../lib/auth.service';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToAuthChanges((user, profile) => {
        setCurrentUser(user);
        setUserProfile(profile);
        setLoading(false);
      });
    } catch (err) {
      console.warn("AuthContext subscription exception:", err);
      setLoading(false);
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const logout = () => {
    return logoutUser();
  };

  const switchRoleProfile = (profileData) => {
    const user = {
      uid: profileData.uid || `demo-${profileData.role.toLowerCase()}-uid`,
      email: profileData.email || `${profileData.role.toLowerCase()}@metrology.gov.in`
    };
    setCurrentUser(user);
    setUserProfile(profileData);
    setSessionProfile(user, profileData);
  };

  const value = {
    currentUser,
    userProfile,
    logout,
    switchRoleProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
