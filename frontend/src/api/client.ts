// API client configuration and base utilities

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Base fetch wrapper with common configuration
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth utilities
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

// Authenticated request wrapper
export async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

// API response types
export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Authentication API calls
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await apiRequest<ApiResponse<LoginResponse>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (response.status !== 'success' || !response.data) {
    throw new Error(response.error || 'Login failed');
  }

  // Store token
  setAuthToken(response.data.token);

  return response.data;
}

export async function register(userData: {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}): Promise<LoginResponse> {
  const response = await apiRequest<ApiResponse<LoginResponse>>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (response.status !== 'success' || !response.data) {
    throw new Error(response.error || 'Registration failed');
  }

  // Store token
  setAuthToken(response.data.token);

  return response.data;
}

export async function getProfile(): Promise<User> {
  const response = await authenticatedRequest<ApiResponse<{ user: User }>>('/api/profile');

  if (response.status !== 'success' || !response.data) {
    throw new Error(response.error || 'Failed to get profile');
  }

  return response.data.user;
}

export async function refreshToken(): Promise<string> {
  const response = await authenticatedRequest<ApiResponse<{ token: string }>>('/api/refresh-token', {
    method: 'POST',
  });

  if (response.status !== 'success' || !response.data) {
    throw new Error(response.error || 'Failed to refresh token');
  }

  const newToken = response.data.token;
  setAuthToken(newToken);

  return newToken;
}

// Logout function
export function logout(): void {
  removeAuthToken();
}
