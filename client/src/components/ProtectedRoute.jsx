import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // --- THE DEVELOPER BYPASS ---
  // Add your fake emails or testing emails to this array
  const legacyEmails = ["novice@guild.dev", "warrior@guild.com", "admin@guilddev.com"];
  const isLegacyUser = currentUser?.email && legacyEmails.includes(currentUser.email);

  // If they are NOT verified, and NOT a legacy user, trap them at the Verify page
  if (!currentUser.emailVerified && !isLegacyUser) {
    // Prevent an infinite redirect loop if they are already on the verify page
    if (location.pathname !== '/verify-email') {
      return <Navigate to="/verify-email" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;