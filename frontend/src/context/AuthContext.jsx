import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('finora_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('finora_token', token);
      authApi.getProfile(token).then((res) => setUser(res.user)).catch(() => setUser(null));
    } else {
      localStorage.removeItem('finora_token');
      setUser(null);
    }
  }, [token]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    setLoading,
    async signIn(email, password) {
      setLoading(true);
      try {
        const res = await authApi.signIn(email, password);
        setToken(res.token);
        setUser(res.user);
        return res;
      } finally {
        setLoading(false);
      }
    },
    async signUp(name, email, password) {
      setLoading(true);
      try {
        const res = await authApi.signUp(name, email, password);
        setToken(res.token);
        setUser(res.user);
        return res;
      } finally {
        setLoading(false);
      }
    },
    async signOut() {
      if (token) {
        try { await authApi.logout(token); } catch (_) {}
      }
      setToken(null);
      setUser(null);
    },
    async refreshProfile() {
      if (!token) return;
      const res = await authApi.getProfile(token);
      setUser(res.user);
    }
  }), [token, user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


