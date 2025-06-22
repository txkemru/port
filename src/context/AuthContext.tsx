'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Profile {
  id?: string;
  avatar?: string;
  name?: string;
  surname?: string;
  username?: string;
  lastUsernameChange?: Date | string;
  telegram?: string;
  instagram?: string;
  description?: string;
  email?: string;
  userId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (profileData: Profile) => void;
  logout: () => void;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const initialProfile: Profile = {
  id: '',
  name: '',
  surname: '',
  username: '',
  description: '',
  lastUsernameChange: '',
  avatar: '',
  telegram: '',
  instagram: '',
  email: '',
  userId: '',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile>(initialProfile);

  // Инициализация из localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedProfile = localStorage.getItem('profile');
    if (storedAuth === 'true' && storedProfile) {
      setIsAuthenticated(true);
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated ? 'true' : 'false');
    localStorage.setItem('profile', JSON.stringify(profile));
  }, [isAuthenticated, profile]);

  const login = (profileData: Profile) => {
    setIsAuthenticated(true);
    setProfile(profileData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('profile', JSON.stringify(profileData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setProfile(initialProfile);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('profile');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, profile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}; 