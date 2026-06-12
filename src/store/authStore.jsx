import React, { createContext, useContext, useState, useEffect } from 'react';
import { API } from '../config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('auth') || 'null');
    if (stored?.user) {
      setUser(stored.user);
      setIsAdmin(stored.isAdmin || false);
      setToken(stored.token || null);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Invalid credentials' };
      setUser(data.user);
      setIsAdmin(data.isAdmin);
      setToken(data.token);
      localStorage.setItem('auth', JSON.stringify({ user: data.user, isAdmin: data.isAdmin, token: data.token }));
      return { success: true, isAdmin: data.isAdmin };
    } catch {
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const signup = async (email) => {
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Signup failed' };
      return { success: true, message: data.message, otpToken: data.otpToken };
    } catch {
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to send reset link' };
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const verifyOtp = async (email, otp, otpToken) => {
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, otpToken }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Verification failed' };
      return { success: true, setupToken: data.setupToken, message: data.message };
    } catch {
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const completeProfile = async (setupToken, name, password, phone, address) => {
    try {
      const res = await fetch(`${API}/auth/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupToken, name, password, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to complete profile' };
      setUser(data.user);
      setIsAdmin(false);
      setToken(data.token);
      localStorage.setItem('auth', JSON.stringify({ user: data.user, isAdmin: false, token: data.token }));
      return { success: true };
    } catch {
      return { success: false, error: 'Server error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setToken(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, token, login, signup, logout, forgotPassword, verifyOtp, completeProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
