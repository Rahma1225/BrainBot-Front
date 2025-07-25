const API_BASE_URL = 'http://localhost:8000'; // FastAPI backend for chat
const API_USER_BASE_URL = 'http://localhost:5156/api'; // .NET backend for user management

// Token management
const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

const getStoredToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token || !expiry) {
    return null;
  }
  
  // Check if token is expired
  const currentTime = new Date().getTime();
  const expiryTime = parseInt(expiry);
  
  if (currentTime > expiryTime) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    return null;
  }
  
  return token;
};

const setStoredToken = (token: string): void => {
  // Set token expiry to 1 hour from now
  const expiry = new Date().getTime() + (60 * 60 * 1000); // 1 hour
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
};

const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

export interface User {
  id: string;
  userName: string;
  email: string;
  role: string;
  isLocked?: boolean;
  lockoutEnd?: Date | null;
  lastActive?: Date;
}

export interface CreateUserDto {
  UserName: string;
  Email: string;
  Password: string;
  Role: string;
}

export interface LoginDto {
  UserName: string;
  Password: string;
}

export interface PasswordUpdateDto {
  UserName: string;
  OldPassword: string;
  NewPassword: string;
}

export interface LockUserDto {
  UserName: string;
  Lock: boolean;
}

export interface EditUserDto {
  Id: string;
  NewUserName: string;
  NewEmail: string;
  NewRole: string;
}

export interface ForgotPasswordDto {
  Email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  errors?: string[];
  data?: T;
}

export interface Role {
  id: string;
  name: string;
  normalizedName: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    baseUrlOverride?: string
  ): Promise<T> {
    const url = `${baseUrlOverride || API_BASE_URL}${endpoint}`;
    
    // Get stored token
    const token = getStoredToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try { 
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData = await response.json().catch(() => ({}));
        // Always throw the error data object if present
        throw errorData && Object.keys(errorData).length > 0 ? errorData : new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users', {}, API_USER_BASE_URL);
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.request<User>(`/users/${username}`, {}, API_USER_BASE_URL);
  }

  async createUser(userData: CreateUserDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, API_USER_BASE_URL);
  }

  async updatePassword(passwordData: PasswordUpdateDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/update-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }, API_USER_BASE_URL);
  }

  async lockUser(lockData: LockUserDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/lock', {
      method: 'PUT',
      body: JSON.stringify(lockData),
    }, API_USER_BASE_URL);
  }

  async editUser(editData: EditUserDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/edit', {
      method: 'PUT',
      body: JSON.stringify(editData),
    }, API_USER_BASE_URL);
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
    }, API_USER_BASE_URL);
  }

  async forgotPassword(emailData: ForgotPasswordDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify(emailData),
    }, API_USER_BASE_URL);
  }

  // Authentication
  async login(credentials: LoginDto): Promise<{
    message: string;
    token: string;
    currentUser: {
      id: string;
      userName: string;
      email: string;
      role: string;
    };
  }> {
    const response = await this.request<{
      message: string;
      token: string;
      currentUser: {
        id: string;
        userName: string;
        email: string;
        role: string;
      };
    }>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, API_USER_BASE_URL);
    // Store token if received
    if (response.token) {
      setStoredToken(response.token);
    }
    return response;
  }

  // Token management methods
  logout(): void {
    clearStoredToken();
    window.location.href = '/login';
  }

  isAuthenticated(): boolean {
    const token = getStoredToken();
    return token !== null;
  }

  getToken(): string | null {
    return getStoredToken();
  }

  // Role Management
  async getRoles(): Promise<Role[]> {
    return this.request<Role[]>('/roles');
  }

  async getRoleById(roleId: string): Promise<Role> {
    return this.request<Role>(`/roles/${roleId}`);
  }

  // Helper method to get role name from role ID
  async getRoleNameFromId(roleId: string): Promise<string> {
    try {
      const role = await this.getRoleById(roleId);
      return role.name;
    } catch (error) {
      console.error('Failed to get role name for ID:', roleId, error);
      return 'user'; // Default fallback
    }
  }

  // Helper method to get the highest role from role IDs
  async getHighestRoleFromIds(roleIds: string[]): Promise<string> {
    if (!roleIds || roleIds.length === 0) {
      return 'user';
    }

    try {
      const roles = await Promise.all(
        roleIds.map(id => this.getRoleNameFromId(id))
      );
      
      // Determine highest role (admin > moderator > user)
      if (roles.includes('admin')) {
        return 'admin';
      } else if (roles.includes('moderator')) {
        return 'moderator';
      } else {
        return 'user';
      }
    } catch (error) {
      console.error('Failed to get highest role from IDs:', error);
      return 'user';
    }
  }

  //Chat
  async askChat(prompt: string): Promise<string> {
    const url = `${API_USER_BASE_URL}/users/ask`; // ✅ Corrected endpoint
    const token = getStoredToken();
  
    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ prompt }),
    };
  
    try {
      const response = await fetch(url, config);
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw errorData && Object.keys(errorData).length > 0 ? errorData : new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json(); // expects { response: string }
      return result.response;
    } catch (error) {
      console.error('Chat API request failed:', error);
      throw error;
    }
  }
  
  
  async uploadDocument(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
  
    const token = getStoredToken();
  
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }), // ✅ Token only
      },
    };
  
    const url = `${API_USER_BASE_URL}/users/upload-document`;
  
    try {
      const response = await fetch(url, config);
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw errorData && Object.keys(errorData).length > 0 ? errorData : new Error(`HTTP error! status: ${response.status}`);
      }
  
      return await response.json(); // expects { message: string }
    } catch (error) {
      console.error('Upload API request failed:', error);
      throw error;
    }
  }
  
  
  
  async deleteDocument(fileName: string): Promise<{ message: string }> {
    const token = getStoredToken();
  
    const config: RequestInit = {
      method: 'DELETE',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  
    const encodedFilename = encodeURIComponent(fileName);
    const url = `${API_USER_BASE_URL}/users/documents/${encodedFilename}`;
  
    try {
      const response = await fetch(url, config);
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw errorData && Object.keys(errorData).length > 0
          ? errorData
          : new Error(`HTTP error! status: ${response.status}`);
      }
  
      return await response.json(); // expects { message: string }
    } catch (error) {
      console.error('Delete API request failed:', error);
      throw error;
    }
  }
  



  async getUserDocuments(): Promise<Array<{ fileName: string; uploadedAt: string }>> {
    const token = getStoredToken();
  
    return this.request<Array<{ fileName: string; uploadedAt: string }>>(
      '/users/my-documents',
      {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }), // ✅ Add token here
        },
      },
      API_USER_BASE_URL
    );
  }
  
  
  


  // async uploadDocumentWithPrompt(file: File, prompt: string): Promise<{ message: string; answer?: string }> {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('prompt', prompt);
  //   return this.request<{ message: string; answer?: string }>(
  //     '/chat/upload',
  //     {
  //       method: 'POST',
  //       body: formData,
  //       headers: {},
  //     },
  //     API_BASE_URL
  //   );
  // }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      '/users/reset-password',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      API_USER_BASE_URL
    );
  }

  // Fetch conversation history for the current user
  async getConversations(): Promise<Array<{ prompt: string; response: string; timestamp: string }>> {
    return this.request<Array<{ prompt: string; response: string; timestamp: string }>>(
      '/users/conversations',
      {},
      API_USER_BASE_URL
    );
  }

  // Conversation API
  async getConversationsList(): Promise<Array<{ id: string; title: string; createdAt: string }>> {
    return this.request<Array<{ id: string; title: string; createdAt: string }>>(
      '/users/conversations', {}, API_USER_BASE_URL
    );
  }
  async createConversation(): Promise<{ id: string; title: string; createdAt: string }> {
    return this.request<{ id: string; title: string; createdAt: string }>(
      '/users/conversations', { method: 'POST' }, API_USER_BASE_URL
    );
  }
  async getConversationMessages(conversationId: string): Promise<Array<{ prompt: string; response: string; timestamp: string }>> {
    return this.request<Array<{ prompt: string; response: string; timestamp: string }>>(
      `/users/conversations/${conversationId}/messages`, {}, API_USER_BASE_URL
    );
  }
  async addMessageToConversation(conversationId: string, prompt: string): Promise<{ prompt: string; response: string; timestamp: string }> {
    return this.request<{ prompt: string; response: string; timestamp: string }>(
      `/users/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ prompt })
        // Do NOT set headers here! The request method will handle it.
      },
      API_USER_BASE_URL
    );
  }

  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/users/conversations/${conversationId}`,
      { method: 'DELETE' },
      API_USER_BASE_URL
    );
  }
}

export const apiService = new ApiService(); 