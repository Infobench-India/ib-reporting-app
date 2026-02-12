import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.VITE_REACT_APP_AUTH_API_URL || 'http://localhost:3051/api/auth';
const REPORT_API_BASE_URL = process.env.VITE_REACT_APP_REPORT_API_URL || 'http://localhost:3052/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  role: string;
  permissions: string[];
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface TokenPayload {
  userId: string;
  email: string;
  roleId: string;
  role: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

class AuthServiceImpl {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null | undefined = null;
  private user: User | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });

    this.loadFromStorage();
    this.setupInterceptors();
  }

  private loadFromStorage() {
    let storedToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    // Bridge from Host Store if available
    if (!storedToken && (window as any).__HOST_STORE__) {
      storedToken = (window as any).__HOST_STORE__.getState().auth.accessToken;
    }

    if (storedToken) this.accessToken = storedToken;
    if (storedRefreshToken) this.refreshToken = storedRefreshToken;
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        let token = this.accessToken;

        // Always try to pull most recent token from host store if integrated
        if ((window as any).__HOST_STORE__) {
          token = (window as any).__HOST_STORE__.getState().auth.accessToken || token;
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            if (this.refreshToken) {
              const response = await this.axiosInstance.post('/refresh-token', {
                refreshToken: this.refreshToken,
              });

              const { accessToken, refreshToken } = response.data;
              this.setTokens(accessToken, refreshToken);

              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private setTokens(accessToken: string, refreshToken: string | null | undefined) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken || '');
  }

  private setUser(user: User) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearStorage() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    roleId?: string
  ): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post<AuthResponse>('/register', {
        email,
        password,
        firstName,
        lastName,
        roleId,
      });

      if (response.data.user) {
        this.setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post<AuthResponse>('/login', {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;
      this.setTokens(accessToken, refreshToken);
      this.setUser(user);

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await this.axiosInstance.post('/logout');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.clearStorage();
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const response = await this.axiosInstance.post<AuthResponse>('/refresh-token', {
        refreshToken: this.refreshToken,
      });

      const { accessToken, refreshToken } = response.data;
      this.setTokens(accessToken, refreshToken);

      return accessToken;
    } catch (error) {
      this.clearStorage();
      throw error;
    }
  }

  async getProfile(): Promise<{ user: User }> {
    try {
      const response = await this.axiosInstance.get<{ user: User }>('/profile');
      if (response.data.user) {
        this.setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null | undefined {
    return this.refreshToken;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.user;
  }

  hasPermission(permission: string): boolean {
    return this.user?.permissions.includes(permission) ?? false;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.user?.role || '');
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decode failed:', error);
      return null;
    }
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const AuthService = new AuthServiceImpl();
