import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function listens to Firebase. 
    // If a user logs in or out, 'user' state updates automatically.
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
      setLoading(false);
      
      if (authenticatedUser) {
        console.log("🔥 Firebase Connected: User is logged in as:", authenticatedUser.email);
      } else {
        console.log("☁️ Firebase Connected: No user logged in.");
      }
    });

    return unsubscribe; 
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};