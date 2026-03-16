import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';

// You can keep the CSS import if you want, 
// but eventually Tailwind will handle most of this.
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            {/* This is your Landing/Login Page */}
            <Route path="/" element={<AuthPage />} />
            
            {/* This is a placeholder for Day 2 */}
            <Route path="/dashboard" element={
              <div className="min-h-screen bg-[#0B0E14] text-white p-10">
                <h1 className="text-3xl font-bold">Welcome to the Adventurer's Hub!</h1>
                <p className="mt-4 text-slate-400">Your quest begins here.</p>
              </div>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;