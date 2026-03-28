import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  sendEmailVerification 
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // 1. EMAIL & PASSWORD AUTH
  // ==========================================
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  // ==========================================
  // 2. SOCIAL AUTH & VERIFICATION
  // ==========================================
  
  // The helper to handle the verification check. 
  // Only send verification if it's a brand new user or not verified.
  const handleSocialAuth = async (user) => {
    if (!user.emailVerified) {
      await sendEmailVerification(user);
      alert("Verification link sent! Check your inbox before logging in.");
      await auth.signOut(); // Kick them out until they click the link
      return false;
    }
    return true;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return await handleSocialAuth(result.user);
    } catch (error) {
      console.error("Google Auth Failed", error);
      throw error;
    }
  };

  const loginWithGithub = async () => {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return await handleSocialAuth(result.user);
    } catch (error) {
      console.error("GitHub Auth Failed", error);
      throw error;
    }
  };

  // ==========================================
  // 3. STATE LISTENER
  // ==========================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Make sure all functions are exposed here!
  const value = {currentUser, signup, login, logout, loginWithGoogle, loginWithGithub};

  return (
    <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
  );
};