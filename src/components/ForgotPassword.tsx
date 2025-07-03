import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import './Login.css';
import "./ForgotPassword.css";
import { ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      await apiService.forgotPassword({ Email: email });
      setStatus('If this email exists, a reset link has been sent.');
    } catch (err: any) {
      setStatus(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-header">
          <h2 className="forgot-title">Forgot Password?</h2>
          <p className="forgot-subtitle">Enter your email address and we'll send you a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <button type="submit" className="reset-password-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          {status && (
            <div className={`forgot-message${status.includes('Failed') ? ' error' : ''}`}>{status}</div>
          )}
        </form>
        <button
          type="button"
          className="back-to-login-btn"
          onClick={() => navigate('/login')}
          style={{ margin: '1.5rem auto 0', display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} style={{ marginRight: 6 }} />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword; 