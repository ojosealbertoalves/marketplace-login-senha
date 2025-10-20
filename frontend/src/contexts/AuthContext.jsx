// frontend/src/contexts/AuthContext.jsx - COM SUPORTE A CLIENT
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Erro ao fazer login' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return { success: true, data };

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  // Registro
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Erro ao criar conta' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return { success: true, data };

    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  // Logout
  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Atualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('http://localhost:3001/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Erro ao atualizar perfil' };
      }

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, data };

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  // Verificar permissões
  const hasPermission = (permission) => {
    if (!user) return false;

    const permissions = {
      'admin': [
        'view_all_users',
        'create_categories',
        'delete_categories',
        'create_cities',
        'delete_cities',
        'delete_users',
        'view_all_data'
      ],
      'professional': [
        'view_own_profile',
        'edit_own_profile',
        'indicate_professionals',
        'view_contact_info'
      ],
      'company': [
        'view_own_profile',
        'edit_own_profile',
        'indicate_professionals',
        'view_contact_info',
        'create_job_openings'
      ],
      // ✨ PERMISSÕES DO CLIENTE
      'client': [
        'view_professionals',
        'view_contact_info',
        'view_own_profile',
        'edit_own_profile'
      ]
    };

    return permissions[user.user_type]?.includes(permission) || false;
  };

  // Headers com autorização para requests
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Fetch com autenticação
  const authFetch = async (url, options = {}) => {
    const authOptions = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    };

    const response = await fetch(url, authOptions);

    // Se token expirou, fazer logout
    if (response.status === 401) {
      await logout();
      throw new Error('Sessão expirada');
    }

    return response;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.user_type === 'admin',
    isProfessional: user?.user_type === 'professional',
    isCompany: user?.user_type === 'company',
    isClient: user?.user_type === 'client', // ✨ NOVO
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    getAuthHeaders,
    authFetch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}