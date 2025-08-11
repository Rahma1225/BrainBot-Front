import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ArrowLeft, User, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import timsoftLogo from '../assets/timsoft.png';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'support'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.registerUser({
        UserName: formData.username,
        Email: formData.email,
        Role: formData.role
      });

      setSuccess('Registration request submitted successfully! Your account will be reviewed by an administrator and you will be notified via email once approved.');
      
      // Clear form after successful submission
      setFormData({
        username: '',
        email: '',
        role: 'support'
      });

    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleBackToSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <button 
          onClick={handleBackToLanding}
          className="back-to-login-btn"
          title="Back to landing page"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="register-header">
          <div className="register-logo">
            <img src={timsoftLogo} alt="Timsoft" className="timsoft-logo" />
            <span>BrainBot</span>
          </div>
          <h1 className="register-title">Join BrainBot</h1>
          <p className="register-subtitle">Request access to our internal dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}
          

          
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <User size={16} />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>
          

          
          <div className="form-group">
            <label htmlFor="role" className="form-label">
              <Shield size={16} />
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input"
              disabled={isLoading}
            >
              <option value="support">Support</option>
              <option value="consultant">Consultant</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="register-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting Request...' : 'Submit Registration Request'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button type="button" className="back-to-login-link" onClick={handleBackToSignIn}>
              Already have an account ? Sign in
            </button>
          </div>
          
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
              <strong style={{ color: '#3b82f6' }}>Registration Process</strong><br />
              Your registration request will be reviewed by an administrator. You will receive an email notification once your account is approved.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;