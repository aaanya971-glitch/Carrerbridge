import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoStudent: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  profileCompletion: number;
  missingProfileFields: string[];
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginAsDemoStudent: async () => {},
  loginAsDemoAdmin: async () => {},
  logout: () => {},
  updateProfile: async () => false,
  profileCompletion: 0,
  missingProfileFields: [],
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cb_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial user on mount
  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('cb_token');
      if (!savedToken) {
        // Default to demo student so app preview opens with rich interactive data immediately
        await loginAsDemoStudent();
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(savedToken);
        } else {
          // Token expired or invalid
          localStorage.removeItem('cb_token');
          await loginAsDemoStudent();
        }
      } catch (err) {
        console.error('Failed to fetch auth user:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('cb_token', data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('cb_token', data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const loginAsDemoStudent = async () => {
    await login('student@careerbridge.edu', 'password123');
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@careerbridge.edu', 'admin123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cb_token');
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    }
  };

  // Compute profile completion percentage and missing fields
  let profileCompletion = 0;
  const missingProfileFields: string[] = [];

  if (user) {
    let score = 0;
    if (user.name) score += 10;
    else missingProfileFields.push('Full Name');

    if (user.education && user.course) score += 20;
    else missingProfileFields.push('Education & Course details');

    if (user.college) score += 15;
    else missingProfileFields.push('College / Institution');

    if (user.skills && user.skills.trim().length > 3) score += 20;
    else missingProfileFields.push('Add Skills');

    if (user.interests && user.interests.trim().length > 3) score += 15;
    else missingProfileFields.push('Add Career Interests');

    if (user.resume_text && user.resume_text.trim().length > 20) score += 10;
    else missingProfileFields.push('Add Resume information');

    if (user.phone && user.location) score += 10;
    else missingProfileFields.push('Contact & Preferred Location');

    profileCompletion = score;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginAsDemoStudent,
        loginAsDemoAdmin,
        logout,
        updateProfile,
        profileCompletion,
        missingProfileFields,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
