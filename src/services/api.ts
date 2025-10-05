// services/api.ts

const API_BASE_URL = 'http://localhost:3000';  // Your backend base URL

export const apiService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Login failed');
    }
    return response.json();
  },

  async logout() {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
    });
  },

  isAuthenticated() {
    return !!localStorage.getItem('user_info');
  },

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/api/users`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to fetch users');
    }
    return response.json();
  },

  // Create user and send verification email via Flask backend at /send-email
  async createUser(userData: { username: string; email: string; role: string }) {
    const body = {
      name: userData.username, // map username to name as backend expects
      email: userData.email,
      role: userData.role,
    };

    console.log('Sending createUser request:', JSON.stringify(body));

    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Create user failed');
    }
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  },

  async editUser(editData: { id: string; username: string; email: string; role: string }) {
    const response = await fetch(`${API_BASE_URL}/api/users/${editData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: editData.username,
        email: editData.email,
        role: editData.role,
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Edit user failed');
    }
    return response.json();
  },

  async lockUser(lockData: { username: string; lock: boolean }) {
    const response = await fetch(`${API_BASE_URL}/api/users/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lockData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Lock/unlock user failed');
    }
    return response.json();
  },

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Delete user failed');
    }
    return response.json();
  },
};
