import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, ArrowLeft, X } from 'lucide-react';
import { apiService } from '../services/api';  // Adjust path if needed
import './UserManagement.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  lastActive: Date;
  avatar: string;
}

interface UserManagementProps {
  currentUser: { id?: string; name: string; email: string; role: string };
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Add User modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user' | 'moderator',
  });
  const [addUserMessage, setAddUserMessage] = useState('');
  const [adding, setAdding] = useState(false);

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Update to match your backend port (3000)
      const response = await fetch("http://localhost:3000/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const apiUsers = await response.json();

      // Debug: log the raw response
      console.log("API users response:", apiUsers);

      // Accept array or object with 'users' key
      let usersArray: any[] = [];
      if (Array.isArray(apiUsers)) {
        usersArray = apiUsers;
      } else if (Array.isArray(apiUsers.users)) {
        usersArray = apiUsers.users;
      } else if (apiUsers.success && Array.isArray(apiUsers.data)) {
        usersArray = apiUsers.data;
      } else {
        setError('Unexpected response format from backend');
        setUsers([]);
        setLoading(false);
        return;
      }

      const transformedUsers: User[] = usersArray.map((apiUser: any, index: number) => ({
        id: apiUser._id || index.toString(),
        name: apiUser.name || 'No Name',
        email: apiUser.email || 'No Email',
        role: (apiUser.role === 'admin' || apiUser.role === 'moderator') ? apiUser.role : 'user',
        status: apiUser.isLocked ? 'inactive' : 'active',
        lastActive: apiUser.created_at ? new Date(apiUser.created_at) : new Date(),
        avatar: '👤',
      }));

      setUsers(transformedUsers);
      setError('');
    } catch (err: any) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Add user handler
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAdding(true);
    try {
      // Send correct field names: name, email, role
      const response = await fetch("http://localhost:3000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess("User added and verification email sent.");
        setNewUser({ name: '', email: '', role: 'user' });
        loadUsers();
      } else {
        setError(data.message || "Failed to add user or send email.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  // Lock/unlock user handler
  const handleToggleLock = async (user: User) => {
    try {
      // Use email for backend, not username
      const newLockStatus = user.status === 'active'; // If active, lock = true; else unlock = false

      await apiService.lockUser({ email: user.email, lock: newLockStatus });

      await loadUsers();
    } catch (error) {
      console.error('Failed to update user lock status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleBackToChatbot = () => {
    navigate('/chatbot');
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days ago`;
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadStatus("File uploaded successfully!");
        setSelectedFile(null);
      } else {
        setUploadStatus(`Upload failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Error uploading file");
    }
  };

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <button onClick={handleBackToChatbot} className="back-btn">
          <ArrowLeft size={20} /> Back to Chatbot
        </button>
        <Users size={30} /> <h1>User Management</h1>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>

        {/* Add User Button */}
        <button onClick={() => setIsAddUserModalOpen(true)}>
          <UserPlus size={20} /> Add User
        </button>

        {/* File Upload */}
        <input
          type="file"
          onChange={handleFileChange}
          style={{ marginLeft: "1rem" }}
        />
        <button
          onClick={handleFileUpload}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "5px 10px",
            marginLeft: "0.5rem",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Upload File
        </button>
        {uploadStatus && (
          <p style={{ color: "green", marginLeft: "1rem" }}>{uploadStatus}</p>
        )}
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "2rem",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            borderRadius: "10px",
            overflow: "hidden"
          }}
        >
          <thead>
            <tr style={{ background: "#f7fafc" }}>
              <th style={{ border: "1px solid #e2e8f0", padding: "0.75rem", fontWeight: 600 }}>User</th>
              <th style={{ border: "1px solid #e2e8f0", padding: "0.75rem", fontWeight: 600 }}>Email</th>
              <th style={{ border: "1px solid #e2e8f0", padding: "0.75rem", fontWeight: 600 }}>Role</th>
              <th style={{ border: "1px solid #e2e8f0", padding: "0.75rem", fontWeight: 600 }}>Status</th>
              <th style={{ border: "1px solid #e2e8f0", padding: "0.75rem", fontWeight: 600 }}>Last Active</th>
              <th style={{ border: "1px solid #e2e8f0", padding: "0.75rem", fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ border: "1px solid #e2e8f0", padding: "0.75rem" }}>{user.avatar} {user.name}</td>
                <td style={{ border: "1px solid #e2e8f0", padding: "0.75rem" }}>{user.email}</td>
                <td style={{ border: "1px solid #e2e8f0", padding: "0.75rem" }}>{user.role}</td>
                <td style={{ border: "1px solid #e2e8f0", padding: "0.75rem" }}>{user.status}</td>
                <td style={{ border: "1px solid #e2e8f0", padding: "0.75rem" }}>{formatLastActive(user.lastActive)}</td>
                <td style={{ border: "1px solid #e2e8f0", padding: "0.75rem" }}>
                  <button
                    onClick={() => handleToggleLock(user)}
                    style={{
                      backgroundColor: user.status === 'active' ? 'red' : 'green',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  >
                    {user.status === 'active' ? 'Lock' : 'Unlock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="navigation-buttons" style={{ margin: "1rem 0" }}>
  <button
    onClick={() => navigate("/upload")}
    style={{
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "5px 10px",
      marginRight: "1rem",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
    }}
  >
    Go to File Upload
  </button>

  <button
    onClick={() => navigate("/evaluations")}
    style={{
      backgroundColor: "#2196F3",
      color: "white",
      padding: "5px 10px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
    }}
  >
    Go to Chatbot Evaluations
  </button>
</div>


      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAddUserModalOpen(false)}>
              <X size={20} />
            </button>
            <h2>Add New User</h2>
            {error && <div style={{ color: "red" }}>{error}</div>}
            {success && <div style={{ color: "green" }}>{success}</div>}
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: "0.5rem" }}>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ width: "100%" }}
                  disabled={adding}
                />
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  style={{ width: "100%" }}
                  disabled={adding}
                />
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <label>Role:</label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, role: e.target.value as 'admin' | 'user' | 'moderator' }))
                  }
                  style={{ width: "100%" }}
                  disabled={adding}
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" disabled={adding}>
                {adding ? "Adding..." : "Add User"}
              </button>
              {addUserMessage && <p>{addUserMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
