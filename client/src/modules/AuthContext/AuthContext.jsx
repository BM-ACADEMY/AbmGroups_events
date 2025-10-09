// src/modules/AuthContext/AuthContext.jsx (Updated - Add register function)
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/modules/axios/axios';
import { showToast } from '@/modules/toast/customToast';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check user authentication status on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get('/auth/user-info', {
          withCredentials: true,
        });
        if (response.data) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Register function
  const register = async (userData) => {
    const { name, phone, email, password, role } = userData;
    const errors = {};

    if (!name) errors.name = 'Name is required';
    if (!phone) errors.phone = 'Phone is required';
    if (!password) errors.password = 'Password is required';
    if (!role) errors.role = 'Role is required';

    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((msg) => showToast('error', msg));
      throw new Error('Validation failed');
    }

    try {
      const response = await axiosInstance.post(
        '/auth/register',
        { name, phone, email, password, role },
        { withCredentials: true }
      );

      // Note: Backend doesn't auto-login; just show success
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed';
      showToast('error', errMsg);
      throw error;
    }
  };

  // Login function
  const login = async (credentials) => {
    const { email, phone, password } = credentials;
    const errors = {};

    if (!email && !phone) errors.identifier = 'Email or phone is required';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((msg) => showToast('error', msg));
      throw new Error('Validation failed');
    }

    try {
      const response = await axiosInstance.post(
        '/auth/login',
        { email, phone, password },
        { withCredentials: true }
      );

      setUser(response.data.user);
      const role = response.data.user.role.name;
      showToast('success', `${role.charAt(0).toUpperCase() + role.slice(1)} login successful`);
      navigate(`/${role}-dashboard`, { replace: true });
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed';
      showToast('error', errMsg);
      throw error;
    }
  };

  // Fetch user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/auth/user-info', {
        withCredentials: true,
      });
      setUser(response.data);
      return response.data;
    } catch (error) {
      setUser(null);
      throw new Error(error.response?.data?.message || 'Failed to fetch user info');
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout', {}, { withCredentials: true });
      setUser(null);
      showToast('success', 'Logged out successfully');
      navigate('/');
    } catch (error) {
      console.log(error);
      showToast('error', 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, getUserInfo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };