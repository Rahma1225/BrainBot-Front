import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, User, Mail, Shield, Clock, Users } from 'lucide-react';
import { apiService } from '../services/api';
import type { RegisterRequest } from '../services/api';
import './RegistrationRequests.css';

const RegistrationRequests: React.FC = () => {
  const [requests, setRequests] = useState<RegisterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingRequest, setApprovingRequest] = useState<string | null>(null);
  const [decliningRequest, setDecliningRequest] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getRegisterRequests();
      setRequests(data);
    } catch (err: any) {
      console.error('Error loading requests:', err);
      setError('Failed to load registration requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      setApprovingRequest(requestId);
      const response = await apiService.approveRegisterRequest(requestId);
      
      // Show success message with default password
      alert(`User approved successfully!\nDefault password: ${response.defaultPassword}`);
      
      // Remove from the list
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setApprovingRequest(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to decline this registration request?')) {
      return;
    }

    try {
      setDecliningRequest(requestId);
      await apiService.declineRegisterRequest(requestId);
      
      // Remove from the list after successful decline
      setRequests(requests.filter(req => req.id !== requestId));
      alert('Registration request declined');
    } catch (err: any) {
      alert(err.message || 'Failed to decline request');
    } finally {
      setDecliningRequest(null);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return '#ef4444';
      case 'support': return '#3b82f6';
      case 'consultant': return '#10b981';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="requests-container">
        <div className="requests-card">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="requests-container">
      <div className="requests-card">
        <button 
          onClick={handleBackToDashboard}
          className="back-btn"
          title="Back to dashboard"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="requests-header">
          <div className="header-content">
            <Users size={24} className="header-icon" />
            <h1>Registration Requests</h1>
          </div>
          <p>Manage pending user registration requests</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="no-requests">
            <Clock size={48} />
            <h3>No Pending Requests</h3>
            <p>All registration requests have been processed.</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <div className="user-info">
                    <div className="user-avatar">
                      <User size={20} />
                    </div>
                    <div className="user-details">
                      <h3>{request.userName}</h3>
                      <div className="user-meta">
                        <span className="email">
                          <Mail size={14} />
                          {request.email}
                        </span>
                        <span 
                          className="role"
                          style={{ color: getRoleColor(request.role) }}
                        >
                          <Shield size={14} />
                          {request.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="request-date">
                    <Clock size={14} />
                    {formatDate(request.requestDate)}
                  </div>
                </div>
                
                <div className="request-actions">
                  <button
                    onClick={() => handleApproveRequest(request.id)}
                    disabled={approvingRequest === request.id}
                    className="approve-btn"
                  >
                    {approvingRequest === request.id ? (
                      'Approving...'
                    ) : (
                      <>
                        <Check size={16} />
                        Approve
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeclineRequest(request.id)}
                    disabled={decliningRequest === request.id}
                    className="decline-btn"
                  >
                    {decliningRequest === request.id ? (
                      'Declining...'
                    ) : (
                      <>
                        <X size={16} />
                        Decline
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationRequests;
