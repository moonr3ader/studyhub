import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";


const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Sign Up Function
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // 2. Log In Function
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 3. Log Out Function
  const logout = () => {
    return signOut(auth);
  };

  // 4. Listen for Login State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};