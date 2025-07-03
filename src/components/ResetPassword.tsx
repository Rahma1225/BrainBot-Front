import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Key, Lock, ArrowLeft } from 'lucide-react';
import './ResetPassword.css';
import { apiService } from '../services/api';
import type { ResetPasswordDto } from '../services/api';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token and email from query params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError(false);
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      setError(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setError(true);
      return;
    }
    if (!token || !email) {
      setMessage('Invalid or missing reset link.');
      setError(true);
      return;
    }
    setLoading(true);
    try {
      const dto: ResetPasswordDto = {
        email,
        token,
        newPassword,
      };
      const response = await apiService.resetPassword(dto);
      setMessage(response.message || 'Password reset successfully! You can now log in.');
      setError(false);
    } catch (err: any) {
      setMessage(err.message || 'Failed to reset password. Please try again.');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-header">
          <h2 className="reset-title">Reset Password</h2>
          <p className="reset-subtitle">Enter your new password below.</p>
        </div>
        <form onSubmit={handleSubmit} className="reset-form">
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              <Key size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} /> New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="form-input"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <Lock size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              disabled={loading}
            />
          </div>
          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          {message && (
            <div className={`reset-message${error ? ' error' : ''}`}>{message}</div>
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

export default ResetPassword; 