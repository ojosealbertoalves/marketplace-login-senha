// frontend/src/contexts/AuthContext.jsx - COM REFRESH USER
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

  // ✅ NOVA FUNÇÃO: Recarregar dados do usuário e do profissional
  const refreshUser = async () => {
    try {
      if (!token) return { success: false, error: 'Não autenticado' };

      console.log('🔄 Recarregando dados do usuário...');
      
      // Buscar dados do usuário
      const userResponse = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        console.log('⚠️ Endpoint /auth/me não existe, tentando /professionals/me...');
        
        // Se não existir /auth/me, buscar do profissional
        const profResponse = await fetch('http://localhost:3001/api/professionals/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const profData = await profResponse.json();

        if (!profResponse.ok) {
          return { success: false, error: profData.error || 'Erro ao recarregar dados' };
        }

        // Atualizar foto do usuário com a foto do profissional
        const updatedUser = {
          ...user,
          profile_photo: profData.data.profile_photo
        };

        console.log('✅ Dados recarregados do profissional:', updatedUser);

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return { success: true, data: updatedUser };
      }

      const userData = await userResponse.json();

      console.log('✅ Dados do usuário recarregados:', userData.user || userData.data);

      const newUser = userData.user || userData.data;
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true, data: newUser };

    } catch (error) {
      console.error('❌ Erro ao recarregar usuário:', error);
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
    isClient: user?.user_type === 'client',
    login,
    register,
    logout,
    updateProfile,
    refreshUser, // ✅ NOVA FUNÇÃO
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