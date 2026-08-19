'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { getUsers } from '@/lib/data-service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string, remember: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  isAdmin: false,
  isViewer: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session
    const savedUser = localStorage.getItem('km_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('km_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, remember: boolean) => {
    setIsLoading(true);
    try {
      const usersList = await getUsers();
      const match = usersList.find(
        u => u.username.toLowerCase() === username.toLowerCase().trim() &&
             (u.password_hash === password || u.password === password)
      );

      if (!match) {
        setIsLoading(false);
        return { success: false, message: 'Username atau password tidak sesuai.' };
      }

      if (match.status === 'Nonaktif') {
        setIsLoading(false);
        return { success: false, message: 'Akun Anda sedang nonaktif. Hubungi Admin.' };
      }

      const sessionUser: User = {
        id: match.id,
        nama: match.nama,
        username: match.username,
        role: match.role,
        status: match.status,
      };

      setUser(sessionUser);

      if (remember) {
        localStorage.setItem('km_session', JSON.stringify(sessionUser));
      } else {
        sessionStorage.setItem('km_session', JSON.stringify(sessionUser));
      }

      setIsLoading(false);
      return { success: true };
    } catch (e) {
      setIsLoading(false);
      return { success: false, message: 'Terjadi kesalahan sistem saat login.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('km_session');
    sessionStorage.removeItem('km_session');
  };

  const isAdmin = user?.role === 'Admin';
  const isViewer = user?.role === 'Viewer';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin, isViewer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
