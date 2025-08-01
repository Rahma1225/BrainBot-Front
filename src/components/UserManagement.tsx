import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, MoreVertical, Edit, Trash2, Shield, Mail, Phone, Clock, ArrowLeft, Lock, Settings, X, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';
import type { User as ApiUser, CreateUserDto, PasswordUpdateDto, LockUserDto, EditUserDto } from '../services/api';
import './UserManagement.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: Date;
  avatar: string;
}

interface UserManagementProps {
  currentUser: { id?: string; name: string; email: string; role: string };
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  React.useEffect(() => {
    console.log('UserManagement mounted');
  }, []);
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // New user modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'admin'
  });
  const [addUserMessage, setAddUserMessage] = useState('');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [lockingUser, setLockingUser] = useState<string | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserData, setEditUserData] = useState({
    username: '',
    email: '',
    role: 'user'
  });
  const [editUserMessage, setEditUserMessage] = useState('');
  const [editUserLoading, setEditUserLoading] = useState(false);

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const apiUsers = await apiService.getUsers();
      // Transform API users to match our interface using the role string from backend
      const transformedUsers: User[] = apiUsers.map((apiUser) => {
        const user = {
          id: apiUser.id,
          name: apiUser.userName,
          email: apiUser.email,
          role: apiUser.role,
          status: (apiUser.isLocked || (apiUser.lockoutEnd && new Date(apiUser.lockoutEnd) > new Date()) ? 'inactive' : 'active') as 'active' | 'inactive' | 'pending',
          lastActive: apiUser.lastActive || new Date(),
          avatar: '👤'
        };
        return user;
      });
      setUsers(transformedUsers);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'support': return '#3b82f6';
      case 'consultant': return '#10b981';
      default: return '#64748b';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  const handleBackToChatbot = () => {
    navigate('/chatbot');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username.trim() || !newUser.email.trim()) {
      setAddUserMessage('Please fill in all fields');
      return;
    }
    
    if (!newUser.email.includes('@')) {
      setAddUserMessage('Please enter a valid email address');
      return;
    }
    
    try {
      setAddUserLoading(true);
      setAddUserMessage('');
      
      const currentYear = new Date().getFullYear();
      const capitalizedUsername = newUser.username.charAt(0).toUpperCase() + newUser.username.slice(1);
      const userData: CreateUserDto = {
        UserName: newUser.username,
        Email: newUser.email,
        Password: `${capitalizedUsername}${currentYear}?`,
        Role: newUser.role
      };
      

      
      await apiService.createUser(userData);
      
      // Keep loading state for 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAddUserMessage('User added successfully!');
      
      // Reset form
      setNewUser({
        username: '',
        email: '',
        role: 'admin'
      });
      
      // Reload users
      await loadUsers();
      
      // Close modal after showing success message
      setTimeout(() => {
        setIsAddUserModalOpen(false);
        setAddUserMessage('');
      }, 1000);
    } catch (err: any) {
      setAddUserMessage(err.message || 'Failed to add user');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleLockUser = async (username: string, isLocked: boolean) => {
    try {
      setLockingUser(username); // Set loading state
      
      const lockData: LockUserDto = {
        UserName: username,
        Lock: isLocked
      };
      
      console.log('Sending lock data:', lockData); // Debug log
      
      const response = await apiService.lockUser(lockData);
      
      // Add a small delay to ensure backend has processed the change
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await loadUsers(); // Reload users to reflect changes
      console.log('Users reloaded after lock operation'); // Debug log
      
      // Check if the user is actually locked now
      const updatedUsers = users.filter(u => u.name === username);
      if (updatedUsers.length > 0) {
        console.log(`User ${username} status after lock operation:`, updatedUsers[0].status);
      }
    } catch (err: any) {
      console.error('Failed to lock/unlock user:', err);
    } finally {
      setLockingUser(null); // Clear loading state
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await apiService.deleteUser(userId);
      await loadUsers(); // Reload users to reflect changes
    } catch (err: any) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleEditUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
      setEditUserData({
        username: user.name,
        email: user.email,
        role: user.role
      });
      setIsEditUserModalOpen(true);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    if (!editUserData.username.trim() || !editUserData.email.trim()) {
      setEditUserMessage('Please fill in all fields');
      return;
    }
    
    if (!editUserData.email.includes('@')) {
      setEditUserMessage('Please enter a valid email address');
      return;
    }
    
    try {
      setEditUserLoading(true);
      setEditUserMessage('');
      
      const editData: EditUserDto = {
        Id: editingUser.id,
        NewUserName: editUserData.username,
        NewEmail: editUserData.email,
        NewRole: editUserData.role
      };
      
      await apiService.editUser(editData);
      
      // Keep loading state for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setEditUserMessage('User updated successfully!');
      
      // Reload users
      await loadUsers();
      
      // Close modal after showing success message
      setTimeout(() => {
        setIsEditUserModalOpen(false);
        setEditUserMessage('');
        setEditingUser(null);
      }, 1000);
    } catch (err: any) {
      setEditUserMessage(err.message || 'Failed to update user');
    } finally {
      setEditUserLoading(false);
    }
  };

  const resetAddUserForm = () => {
    setNewUser({
      username: '',
      email: '',
      role: 'admin'
    });
    setAddUserMessage('');
  };

  const resetEditUserForm = () => {
    setEditUserData({
      username: '',
      email: '',
      role: 'user'
    });
    setEditUserMessage('');
    setEditingUser(null);
  };

  return (
    <div className="user-management-page-modern-wrapper">
      <button className="user-management-back-btn-fixed" onClick={handleBackToChatbot} title="Back to Chatbot">
        <ArrowLeft size={20} />
      </button>
      <div className="user-management-page-header">
        <div className="user-management-page-header-icon">
          <Users size={36} />
        </div>
        <div>
          <h1 className="user-management-page-header-title">User Management</h1>
          <div className="user-management-page-header-sub">Manage users, roles, and permissions</div>
        </div>
      </div>
      <div className="user-management-page-main">
        <div className="user-management-content">
          <div className="filters-section">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ color: '#000' }}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="support">Support</option>
            <option value="consultant">Consultant</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button 
            className="add-user-btn"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </div>

      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadUsers} className="retry-btn">Retry</button>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="user-row">
                  <td className="user-cell">
                    <div className="user-info-cell">
                      <div className="user-avatar-small">
                        {user.avatar}
                      </div>
                      <div className="user-details-cell">
                        <span className="user-name-cell">{user.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">
                    <span className="email-text">{user.email}</span>
                  </td>
                  <td className="role-cell">
                    <span 
                      className="role-badge-table"
                      style={{ backgroundColor: getRoleColor(user.role) + '20', color: getRoleColor(user.role) }}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="status-cell">
                    <div className="status-indicator-cell">
                      <div 
                        className="status-dot" 
                        style={{ backgroundColor: getStatusColor(user.status) }}
                      ></div>
                      <span className="status-text">{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                    </div>
                  </td>
                  <td className="last-active-cell">
                    <span className="last-active-text">{formatLastActive(user.lastActive)}</span>
                  </td>
                  <td className="actions-cell">
                    {currentUser.role === 'admin' && (
                      <div className="table-actions">
                        <button 
                          className="table-action-btn edit-btn" 
                          title="Edit User"
                          onClick={() => handleEditUser(user.id)}
                        >
                          ✎
                        </button>
                        <button 
                          className={`table-action-btn lock-btn ${user.status === 'inactive' ? 'locked' : ''}`}
                          title={user.status === 'active' ? 'Lock User' : 'Unlock User'}
                          onClick={() => handleLockUser(user.name, user.status === 'active')}
                          disabled={lockingUser === user.name}
                        >
                          {lockingUser === user.name ? '⏳' : (user.status === 'active' ? '🔒' : '🔓')}
                        </button>
                        <button 
                          className="table-action-btn delete-btn" 
                          title="Remove User"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="empty-state">
            <Users size={48} className="empty-icon" />
            <h3>No users found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
    </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserModalOpen(false)}>
          {addUserLoading && <div className="loading-spinner"></div>}
          <div className={`modal-content ${addUserLoading ? 'loading' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button 
                className="modal-close-btn"
                onClick={() => {
                  setIsAddUserModalOpen(false);
                  resetAddUserForm();
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="add-user-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="support">Support</option>
                  <option value="consultant">Consultant</option>
                </select>
              </div>
              
              {addUserMessage && (
                <div className={`add-user-message ${addUserMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {addUserMessage}
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="modal-cancel-btn"
                  onClick={() => {
                    setIsAddUserModalOpen(false);
                    resetAddUserForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="modal-submit-btn"
                  disabled={addUserLoading}
                >
                  <>
                    <UserPlus size={12} />
                    Add User
                  </>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && editingUser && (
        <div className="modal-overlay" onClick={() => setIsEditUserModalOpen(false)}>
          {editUserLoading && <div className="loading-spinner"></div>}
          <div className={`modal-content ${editUserLoading ? 'loading' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button 
                className="modal-close-btn"
                onClick={() => {
                  setIsEditUserModalOpen(false);
                  resetEditUserForm();
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="add-user-form">
              <div className="form-group">
                <label htmlFor="edit-username">Username</label>
                <input
                  type="text"
                  id="edit-username"
                  value={editUserData.username}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-email">Email Address</label>
                <input
                  type="email"
                  id="edit-email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-role">Role</label>
                <select
                  id="edit-role"
                  value={editUserData.role}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, role: e.target.value }))}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="support">Support</option>
                  <option value="consultant">Consultant</option>
                </select>
              </div>
              
              {editUserMessage && (
                <div className={`add-user-message ${editUserMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {editUserMessage}
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="modal-cancel-btn"
                  onClick={() => {
                    setIsEditUserModalOpen(false);
                    resetEditUserForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="modal-submit-btn"
                  disabled={editUserLoading}
                >
                  <>
                    <Edit size={12} />
                    Update
                  </>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 