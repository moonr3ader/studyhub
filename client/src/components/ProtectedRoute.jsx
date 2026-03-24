import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  // If a user logs out or tries to sneak in, 
  // send them to the Landing page ('/') instead of the Auth page.
  if (!currentUser) {
    return <Navigate to="/" replace />; 
  }
  
  // If they are logged in, render the requested page (the 'children')
  return children;
};

export default ProtectedRoute;