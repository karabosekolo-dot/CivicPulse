
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  register: (email: string, name: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('civicpulse_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const handleMessage = (event: MessageEvent) => {
      // Validate origin in production
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const oauthUser = event.data.user;
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: oauthUser.email,
          name: oauthUser.name,
          avatarUrl: oauthUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${oauthUser.name}`
        };
        setUser(newUser);
        localStorage.setItem('civicpulse_user', JSON.stringify(newUser));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const login = (email: string, name: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    setUser(newUser);
    localStorage.setItem('civicpulse_user', JSON.stringify(newUser));
  };

  const register = (email: string, name: string) => {
    login(email, name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civicpulse_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
