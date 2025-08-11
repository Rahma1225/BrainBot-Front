import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Key } from 'lucide-react';
import { apiService } from '../services/api';
import timsoftLogo from '../assets/timsoft.png';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setIsSuccess(false);
    setLoading(true);
    
    try {
      await apiService.forgotPassword({ Email: email });
      setStatus('If this email exists, a reset link has been sent to your email address.');
      setIsSuccess(true);
    } catch (err: any) {
      setStatus(err.message || 'Failed to send reset email. Please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <button 
          onClick={handleBackToLanding}
          className="back-to-landing-btn"
          title="Back to landing page"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="forgot-password-header">
          <div className="forgot-password-logo">
            <img src={timsoftLogo} alt="Timsoft" className="timsoft-logo" />
            <span>BrainBot</span>
          </div>
          <h1 className="forgot-password-title">Reset Your Password</h1>
          <p className="forgot-password-subtitle">Enter your email address and we'll send you a reset link</p>
        </div>
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
          {status && (
            <div className={`status-message ${isSuccess ? 'success' : 'error'}`}>
              {status}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="reset-password-btn"
            disabled={loading}
          >
            {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="back-to-login-link" 
              onClick={handleBackToLogin}
            >
              <ArrowLeft size={16} style={{ marginRight: '6px' }} />
              Back to Sign In
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
              <strong style={{ color: '#3b82f6' }}>Password Reset Process</strong><br />
              You will receive an email with a link to reset your password. The link will expire in 1 hour for security reasons.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 