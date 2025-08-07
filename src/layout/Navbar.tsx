import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, LogOut, Bot, Users, ChevronDown, Lock, FileUp, BarChart3, UserCheck } from 'lucide-react';
import { apiService } from '../services/api';
import './Navbar.css';

interface NavbarProps {
  onLogout: () => void;
  currentUser: { name: string; email: string; role: string };
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, currentUser }) => {
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuBtnRef = useRef<HTMLButtonElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    // Close menu on escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isUserMenuOpen) {
        setIsUserMenuOpen(false);
        userMenuBtnRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isUserMenuOpen]);

  // Fetch pending requests count for admin users
  useEffect(() => {
    if (currentUser.role === 'admin') {
      const fetchPendingRequests = async () => {
        try {
          const requests = await apiService.getRegisterRequests();
          setPendingRequestsCount(requests.length);
        } catch (error) {
          console.error('Failed to fetch pending requests count:', error);
          setPendingRequestsCount(0);
        }
      };

      // Fetch immediately
      fetchPendingRequests();

      // Set up interval to check every 30 seconds
      const interval = setInterval(fetchPendingRequests, 30000);

      return () => clearInterval(interval);
    }
  }, [currentUser.role]);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleMenuItemClick = () => {
    setIsUserMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    onLogout();
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-logo">
          <div className="logo-icon-container">
            <Bot className="logo-icon" />
          </div>
          <span className="logo-text">BrainBot</span>
        </div>
        
        <div className="nav-actions">
          <div className="user-menu" ref={userMenuRef}>
            <button 
              ref={userMenuBtnRef}
              className="user-menu-btn"
              onClick={handleUserMenuToggle}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              aria-label={`User menu for ${currentUser.name}`}
            >
              <div className="user-avatar" aria-hidden="true">
                {getUserInitials(currentUser.name)}
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">• {currentUser.role}</span>
              </div>
              <ChevronDown 
                size={16} 
                className={`chevron ${isUserMenuOpen ? 'open' : ''}`} 
                aria-hidden="true"
              />
            </button>
            
            {isUserMenuOpen && (
              <div 
                className="user-dropdown"
                role="menu"
                aria-label="User menu options"
              >
                <div className="dropdown-header">
                  <div className="dropdown-avatar" aria-hidden="true">
                    {getUserInitials(currentUser.name)}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-name">{currentUser.name}</span>
                    <span className="dropdown-email">{currentUser.email}</span>
                  </div>
                </div>
                
                <div className="dropdown-divider" aria-hidden="true"></div>
                
                {currentUser.role === 'admin' && (
                  <Link 
                    to="/dashboard" 
                    className="dropdown-item"
                    onClick={handleMenuItemClick}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <BarChart3 size={16} aria-hidden="true" />
                    <span>Dashboard</span>
                  </Link>
                )}
                {currentUser.role === 'admin' && (
                  <Link 
                    to="/upload" 
                    className="dropdown-item"
                    onClick={handleMenuItemClick}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <FileUp size={16} aria-hidden="true" />
                    <span>Upload Files</span>
                  </Link>
                )}
                {currentUser.role === 'admin' && (
                  <Link 
                    to="/user-management" 
                    className="dropdown-item"
                    onClick={handleMenuItemClick}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <Users size={16} aria-hidden="true" />
                    <span>User Management</span>
                  </Link>
                )}
                {currentUser.role === 'admin' && (
                  <Link 
                    to="/registration-requests" 
                    className="dropdown-item"
                    onClick={handleMenuItemClick}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <div className="menu-item-content">
                      <UserCheck size={16} aria-hidden="true" />
                      <span>Registration Requests</span>
                      {pendingRequestsCount > 0 && (
                        <div className="notification-badge">
                          {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                        </div>
                      )}
                    </div>
                  </Link>
                )}
                
                <Link 
                  to="/settings" 
                  className="dropdown-item"
                  onClick={handleMenuItemClick}
                  role="menuitem"
                  tabIndex={0}
                >
                  <Lock size={16} aria-hidden="true" />
                  <span>Settings</span>
                </Link>
                
                <button 
                  className="dropdown-item logout-item"
                  onClick={handleLogoutClick}
                  role="menuitem"
                  tabIndex={0}
                  aria-label="Sign out"
                >
                  <LogOut size={16} aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 