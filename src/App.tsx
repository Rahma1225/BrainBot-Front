import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Landing from './components/Landing';
import Chatbot from './components/Chatbot';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import Layout from './layout/Layout';
import { apiService } from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user' | 'moderator'
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
              role: userInfo.role || 'user'
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
      roles: string[];
    };
    token?: string;
  }) => {
    console.log('Login successful:', userData);
    
    if (userData.userInfo) {
      // Get the highest role from the database using role IDs
      const roles = userData.userInfo.roles || [];
      console.log('Role IDs received:', roles);
      
      let role: 'admin' | 'user' | 'moderator' = 'user';
      
      // Temporary role ID mapping until backend endpoints are ready
      if (roles.length > 0) {
        const roleId = roles[0];
        console.log('Checking role ID:', roleId);
        
        // Map known role IDs to role names
        if (roleId === '8e8af7ac-69ba-476a-8be0-682efb94555a') {
          role = 'admin';
          console.log('Mapped to admin role');
        } else if (roleId === 'moderator-role-id') { // Replace with actual moderator role ID
          role = 'moderator';
          console.log('Mapped to moderator role');
        } else {
          role = 'user';
          console.log('Mapped to user role (default)');
        }
      }
      
      const userInfo = {
        name: userData.userInfo.userName,
        email: userData.userInfo.email,
        role: role
      };
      
      console.log('Final user info:', userInfo);
      setCurrentUser(userInfo);
      
      // Store user info in localStorage for persistence
      localStorage.setItem('user_info', JSON.stringify({
        userName: userData.userInfo.userName,
        email: userData.userInfo.email,
        role: role
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
                <Layout onLogout={handleLogout} currentUser={currentUser}>
                  <UserManagement currentUser={currentUser} />
                </Layout>
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

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
