import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, User, Mail, Shield, Clock, Users, UserCheck } from 'lucide-react';
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
    navigate('/chatbot');
  };

  const formatDate = (dateString: string) => {
    try {
      // Debug: Log the incoming date string
      console.log('Incoming date string:', dateString);
      
      // Handle different date formats from backend
      let date: Date;
      
      // If it's already a valid date string, use it directly
      if (dateString && dateString !== 'null' && dateString !== 'undefined') {
        // Try multiple date parsing strategies
        date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          // Try parsing as ISO string (replace space with T)
          const isoDate = new Date(dateString.replace(' ', 'T'));
          if (!isNaN(isoDate.getTime())) {
            date = isoDate;
          } else {
            // Try parsing as .NET DateTime format (common in .NET backends)
            const dotNetDate = new Date(dateString.replace(/\.\d+/, ''));
            if (!isNaN(dotNetDate.getTime())) {
              date = dotNetDate;
            } else {
              // Try parsing as UTC string
              const utcDate = new Date(dateString + 'Z');
              if (!isNaN(utcDate.getTime())) {
                date = utcDate;
              } else {
                // If all parsing fails, return a fallback
                console.warn('Could not parse date:', dateString);
                return 'Date not available';
              }
            }
          }
        }
      } else {
        return 'Date not available';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return 'Date not available';
    }
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
      <div className="registration-requests-page-modern-wrapper">
        <div className="registration-requests-page-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading registration requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-requests-page-modern-wrapper">
      <button 
        className="registration-requests-back-btn-fixed" 
        onClick={handleBackToDashboard} 
        title="Back to Chatbot"
      >
        <ArrowLeft size={20} />
      </button>
      
      <div className="registration-requests-page-header">
        <div className="registration-requests-page-header-icon">
          <UserCheck size={36} />
        </div>
        <div>
          <h1 className="registration-requests-page-header-title">Registration Requests</h1>
          <div className="registration-requests-page-header-sub">Review and manage pending user registration requests</div>
        </div>
      </div>

      <div className="registration-requests-page-main">
        <div className="registration-requests-content">
          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadRequests} className="retry-btn">Retry</button>
            </div>
          )}

          {requests.length === 0 ? (
            <div className="empty-state">
              <Clock size={48} className="empty-icon" />
              <h3>No Pending Requests</h3>
              <p>All registration requests have been processed.</p>
            </div>
          ) : (
            <div className="requests-cards-container">
              {requests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-card-header">
                    <div className="request-user-info">
                      <div className="request-user-avatar">
                        <User size={20} />
                      </div>
                      <div className="request-user-details">
                        <h3 className="request-username">{request.userName}</h3>
                        <div className="request-user-meta">
                          <span className="request-email">
                            <Mail size={14} />
                            {request.email}
                          </span>
                          <span 
                            className="request-role"
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
                       {formatDate(request.requestedAt)}
                     </div>
                  </div>
                  
                  <div className="request-card-actions">
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      disabled={approvingRequest === request.id}
                      className="request-approve-btn"
                    >
                      {approvingRequest === request.id ? (
                        <div className="loading-spinner-small"></div>
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
                      className="request-decline-btn"
                    >
                      {decliningRequest === request.id ? (
                        <div className="loading-spinner-small"></div>
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
    </div>
  );
};

export default RegistrationRequests;
