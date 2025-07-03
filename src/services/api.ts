const API_BASE_URL = 'http://localhost:5156/api'; // Updated to match .NET backend port

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
  roles: string[];
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
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
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
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          clearStoredToken();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        
        // Check for specific error types
        if (errorData.errors && typeof errorData.errors === 'object') {
          // Handle validation errors
          const errorMessages = Object.values(errorData.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        
        // Check for specific error messages
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        
        // Check for locked account in response text
        if (errorData.title && errorData.title.toLowerCase().includes('locked')) {
          throw new Error('Account is locked. Please contact administration for assistance.');
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.request<User>(`/users/${username}`);
  }

  async createUser(userData: CreateUserDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updatePassword(passwordData: PasswordUpdateDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/update-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async lockUser(lockData: LockUserDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/lock', {
      method: 'PUT',
      body: JSON.stringify(lockData),
    });
  }

  async editUser(editData: EditUserDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/edit', {
      method: 'PUT',
      body: JSON.stringify(editData),
    });
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async forgotPassword(emailData: ForgotPasswordDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  // Authentication
  async login(credentials: LoginDto): Promise<{
    message: string;
    token: string;
    currentUser: {
      id: string;
      userName: string;
      email: string;
      roles: string[];
    };
  }> {
    try {
      const response = await this.request<{
        message: string;
        token: string;
        currentUser: {
          id: string;
          userName: string;
          email: string;
          roles: string[];
        };
      }>('/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      // Store token if received
      if (response.token) {
        setStoredToken(response.token);
      }
      
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      // Handle specific error cases
      if (error.message && error.message.includes('400')) {
        // Check if it's a locked account error
        if (error.message.toLowerCase().includes('locked') || 
            error.message.toLowerCase().includes('account is locked')) {
          throw new Error('Account is locked. Please contact administration for assistance.');
        }
        // Check if it's invalid credentials
        if (error.message.toLowerCase().includes('invalid') || 
            error.message.toLowerCase().includes('credentials')) {
          throw new Error('Invalid username or password. Please check your credentials.');
        }
      }
      throw error;
    }
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
}

export const apiService = new ApiService(); 