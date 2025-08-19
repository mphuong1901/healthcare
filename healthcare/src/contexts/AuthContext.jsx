import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // đổi sang profile() vì API đang như vậy
      const response = await authAPI.profile();
      if (response.data.user) {
        setCurrentUser(response.data.user);
        localStorage.setItem('healthlink_user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('healthlink_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    console.log('Login payload:', { email, password });

    try {
      const response = await authAPI.login({ email, password });

      const { user, token } = response.data;

      if (user) {
        setCurrentUser(user);
        localStorage.setItem('healthlink_user', JSON.stringify(user));
        localStorage.setItem('token', token);
        return user;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    }
  };

const register = async (userData) => {
  try {
    // Log payload gửi lên server để debug
    console.log('Register payload:', userData);

    const response = await authAPI.register(userData);
    const { user, token } = response.data;

    // Nếu là patient hoặc userData.role === 'patient', tự động đăng nhập
    if (userData.role === 'patient' && user) {
      setCurrentUser(user);
      localStorage.setItem('healthlink_user', JSON.stringify(user));
      localStorage.setItem('token', token);
    }

    return user;
  } catch (error) {
    // Lấy message chi tiết từ backend nếu có
    const backendMessage = error.response?.data?.message;

    if (backendMessage) {
      toast.error(backendMessage);
      console.error('Register error (backend):', backendMessage);
      throw new Error(backendMessage);
    } else {
      toast.error('Đăng ký thất bại. Vui lòng thử lại.');
      console.error('Register error:', error);
      throw new Error(error.message || 'Đăng ký thất bại');
    }
  }
};


  const logout = async () => {
    try {
      // Nếu API backend chưa có logout thì comment dòng dưới lại
      if (authAPI.logout) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('healthlink_user');
      localStorage.removeItem('token');
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
