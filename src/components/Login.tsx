import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import timsoftLogo from '../assets/timsoft.png';
import './Login.css';

interface LoginProps {
  onLogin: (userData: { 
    username: string; 
    password: string;
    userInfo?: {
      id: string;
      userName: string;
      email: string;
      roles: string[];
    };
    token?: string;
  }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLockedAccount, setIsLockedAccount] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsLockedAccount(false);
    
    try {
      const response = await apiService.login({
        UserName: formData.username,
        Password: formData.password
      });
      
      console.log('Login response:', response);
      
      // Check if user is locked by getting all users and finding the current user
      try {
        const allUsers = await apiService.getUsers();
        const currentUser = allUsers.find(user => user.userName === formData.username);
        
        if (currentUser) {
          console.log('Current user details:', currentUser);
          
          if (currentUser.isLocked || (currentUser.lockoutEnd && new Date(currentUser.lockoutEnd) > new Date())) {
            setError('Your account is locked. Please contact administration for assistance.');
            setIsLockedAccount(true);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to check user lock status:', err);
        // Continue with login if we can't check lock status
      }
      
      // Store user info and token (handle case where token might not be present yet)
      onLogin({
        username: formData.username,
        password: formData.password,
        userInfo: {
          id: response.currentUser.id,
          userName: response.currentUser.userName,
          email: response.currentUser.email,
          roles: response.currentUser.roles || []
        },
        token: response.token
      });
      
      console.log('Login successful, token present:', !!response.token);
    } catch (err: any) {
      console.error('Login error:', err);
      // Check if the error is due to locked account
      if (err.message && err.message.toLowerCase().includes('locked')) {
        setError('Your account is locked. Please contact administration for assistance.');
        setIsLockedAccount(true);
      } else if (err.message && err.message.toLowerCase().includes('invalid')) {
        setError('Invalid username or password. Please check your credentials.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button 
          onClick={handleBackToLanding}
          className="back-to-landing-btn"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="login-header">
          <div className="login-logo">
            <img src={timsoftLogo} alt="Timsoft" className="timsoft-logo" />
            <span>BrainBot</span>
          </div>
          <h1 className="login-title">Welcome to BrainBot</h1>
          <p className="login-subtitle">Sign in to access your internal dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className={`error-message ${isLockedAccount ? 'locked-account' : ''}`}>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-field-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="form-input"
                style={{ paddingRight: '3rem' }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.1)'
          }}>
            <p style={{ 
              margin: 0, 
              color: '#64748b', 
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              <strong style={{ color: '#3b82f6' }}>Internal Access Only</strong><br />
              This application is restricted to authorized personnel only.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 