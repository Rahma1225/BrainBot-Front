import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';
import type { PasswordUpdateDto } from '../services/api';
import './Settings.css';

interface SettingsProps {
  currentUser: { id?: string; name: string; email: string; role: string };
}

const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleBackToChatbot = () => {
    navigate('/chatbot');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordMessage('Password must be at least 8 characters long');
      return;
    }
    
    try {
      const passwordData: PasswordUpdateDto = {
        UserName: currentUser.name,
        OldPassword: currentPassword,
        NewPassword: newPassword
      };
      
      await apiService.updatePassword(passwordData);
      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setPasswordMessage('');
      }, 3000);
    } catch (err: any) {
      setPasswordMessage(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="header-content">
          <div className="header-title">
            <button className="back-btn" onClick={handleBackToChatbot} title="Back to Chatbot">
              <ArrowLeft size={20} />
              <span className="back-text">Back to Chatbot</span>
            </button>
            <Lock size={24} className="header-icon" />
            <h1>Settings</h1>
          </div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Change Password</h2>          
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <span
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <span
                  onClick={() => setShowNewPassword((v) => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <span
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>
            
            {passwordMessage && (
              <div className={`password-message ${passwordMessage.includes('successfully') ? 'success' : 'error'}`}>
                {passwordMessage}
              </div>
            )}
            
            <button type="submit" className="change-password-btn">
              <Lock size={16} />
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings; 