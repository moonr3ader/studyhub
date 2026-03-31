import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // --- THE DEVELOPER WILDCARD BYPASS ---
  // 1. Check if it's a specific admin email
  const adminEmails = ["admin@guild.com"]; 
  const isAdmin = currentUser?.email && adminEmails.includes(currentUser.email);
  
  // 2. Check if it's a dummy testing account (ends with @test.com or @dummy.com)
  const isDummyAccount = currentUser?.email && (
    currentUser.email.endsWith('@test.com') || 
    currentUser.email.endsWith('@dummy.com')
  );

  // If they are NOT verified, NOT an admin, and NOT a dummy account, trap them.
  if (!currentUser.emailVerified && !isAdmin && !isDummyAccount) {
    // Prevent an infinite redirect loop if they are already on the verify page
    if (location.pathname !== '/verify-email') {
      return <Navigate to="/verify-email" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;