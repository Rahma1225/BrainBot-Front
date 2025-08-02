import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Landing from './components/Landing';
import Chatbot from './components/Chatbot';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import Layout from './layout/Layout';
import { apiService } from './services/api';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';
import UploadDocument from './components/UploadDocument';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    name: '',
    email: '',
    role: ''
  });

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuth = apiService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      // If authenticated, restore user info from localStorage
      if (isAuth) {
        const storedUserInfo = localStorage.getItem('user_info');
        if (storedUserInfo) {
          try {
            const userInfo = JSON.parse(storedUserInfo);
            setCurrentUser({
              name: userInfo.userName || '',
              email: userInfo.email || '',
              role: userInfo.role // Use the exact string from backend
            });
          } catch (error) {
            console.error('Error parsing stored user info:', error);
            // If we can't parse the stored user info, clear it and redirect to login
            localStorage.removeItem('user_info');
            apiService.logout();
            setIsAuthenticated(false);
          }
        }
      } else {
        localStorage.removeItem('user_info');
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async (userData: { 
    username: string; 
    password: string;
    userInfo?: {
      id: string;
      userName: string;
      email: string;
      role: string;
    };
    token?: string;
  }) => {
    console.log('Login successful:', userData);
    
    if (userData.userInfo) {
      setCurrentUser({
        name: userData.userInfo.userName,
        email: userData.userInfo.email,
        role: userData.userInfo.role
      });
      // Store user info in localStorage for persistence
      localStorage.setItem('user_info', JSON.stringify({
        userName: userData.userInfo.userName,
        email: userData.userInfo.email,
        role: userData.userInfo.role
      }));
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_info'); // Clear stored user info
    apiService.logout(); // This will clear token and redirect to login
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return <div className="loading-container">Loading...</div>;
    }
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
  };

  // Public Route Component (redirects to chatbot if already authenticated)
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return <div className="loading-container">Loading...</div>;
    }
    return isAuthenticated ? <Navigate to="/chatbot" replace /> : <>{children}</>;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login onLogin={handleLogin} />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/chatbot" 
            element={
              <ProtectedRoute>
                <Layout onLogout={handleLogout} currentUser={currentUser}>
                  <Chatbot currentUser={currentUser} />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                {currentUser.role === 'admin' ? (
                  <Layout onLogout={handleLogout} currentUser={currentUser}>
                    <UserManagement currentUser={currentUser} />
                  </Layout>
                ) : (
                  <Navigate to="/chatbot" replace />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout onLogout={handleLogout} currentUser={currentUser}>
                  <Settings currentUser={currentUser} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout onLogout={handleLogout} currentUser={currentUser}>
                  {currentUser.role === 'admin' ? (
                    <Dashboard currentUser={currentUser} />
                  ) : (
                    <Navigate to="/chatbot" replace />
                  )}
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Layout onLogout={handleLogout} currentUser={currentUser}>
                  {currentUser.role === 'admin' ? (
                    <UploadDocument />
                  ) : (
                    <Navigate to="/chatbot" replace />
                  )}
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
