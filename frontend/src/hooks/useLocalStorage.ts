import { useState, useEffect } from 'react';

// Custom hook for localStorage with React state synchronization
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Hook for managing authentication state
export function useAuth() {
  const [token, setToken] = useLocalStorage<string | null>('auth_token', null);
  const [user, setUser] = useLocalStorage<any>('user', null);

  const login = (authToken: string, userData: any) => {
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  };
}
