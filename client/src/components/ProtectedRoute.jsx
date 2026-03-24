import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // If there is no logged-in user, bounce them to the Auth page
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // If they are logged in, render the requested page (the 'children')
  return children;
};

export default ProtectedRoute;