// frontend/src/contexts/AuthContext.jsx - VERSÃO FINAL
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar token salvo ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          // Verificar se o token ainda é válido
          const response = await fetch('http://localhost:3001/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });

          if (response.ok) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          } else {
            // Token inválido - limpar storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Erro no login';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, data };

    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  // Registro
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        let errorMessage = 'Erro no cadastro';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, data };

    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Chamar endpoint de logout se token existe
      if (token) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {
          // Ignorar erro no logout - pode ser que o servidor esteja offline
          console.log('Erro no logout do servidor, mas limpando dados locais');
        });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Sempre limpar estado e storage
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao atualizar perfil';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      
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
};