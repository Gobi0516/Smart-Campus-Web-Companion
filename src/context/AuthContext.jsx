import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as authLogin, signup as authSignup, logout as authLogout, getCurrentUser } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const loadUser = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (credentials) => {
    // Simulate slight delay for better UX
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const loggedInUser = authLogin(credentials);
          setUser(loggedInUser);
          resolve(loggedInUser);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  };

  const signup = async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          authSignup(userData);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
