import { useState, useEffect } from 'react';
import { getProfile, type User } from '../api/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Try to get user profile with the token
        const userProfile = await getProfile();
        setUser(userProfile);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token might be expired or invalid, remove it
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    clearAuth,
  };
}