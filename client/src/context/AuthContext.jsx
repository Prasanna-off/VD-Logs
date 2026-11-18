import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vd_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vd_token'));
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('vd_token');
      localStorage.removeItem('vd_user');
      setToken(null);
      setUser(null);
    }
  };

  const loginAdmin = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    const { session, user: adminUser } = res.data.data;
    localStorage.setItem('vd_token', session.access_token);
    localStorage.setItem('vd_user', JSON.stringify(adminUser));
    setToken(session.access_token);
    setUser(adminUser);
    return adminUser;
  };

  const loginStaff = async (staffId, password) => {
    const res = await api.post('/auth/staff/login', { staff_id: staffId, password });
    const { session, user: staffUser } = res.data.data;
    localStorage.setItem('vd_token', session.access_token);
    localStorage.setItem('vd_user', JSON.stringify(staffUser));
    setToken(session.access_token);
    setUser(staffUser);
    return staffUser;
  };

  // Sync session on initial app load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('vd_token');
      if (savedToken) {
        try {
          const { data } = await api.get('/auth/me');
          const userData = {
            id: data.data.profile.id,
            role: data.data.profile.role,
            display_name: data.data.profile.display_name,
            theme_preference: data.data.profile.theme_preference,
            staff: data.data.staff || null,
            email: data.data.user.email
          };
          setUser(userData);
          localStorage.setItem('vd_user', JSON.stringify(userData));
        } catch (err) {
          console.error('[Auth Init Error]', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login: loginAdmin, loginAdmin, loginStaff, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
