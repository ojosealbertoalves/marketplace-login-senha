// frontend/src/contexts/AuthContext.jsx - VERSÃO CORRIGIDA
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

  // ✅ CORRIGIDO: Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log('✅ Usuário carregado do localStorage:', parsedUser);
      } catch (error) {
        console.error('❌ Erro ao parsear usuário do localStorage:', error);
        // Limpa localStorage se tiver dados corrompidos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      // Limpa localStorage se tiver dados inválidos
      console.log('⚠️ Dados inválidos no localStorage, limpando...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    setLoading(false);
  }, []);

  // ✅ CORRIGIDO: Login
  const login = async (credentials) => {
    try {
      console.log('🔐 Tentando login...', credentials);
      console.log('📧 Email:', credentials.email);
      console.log('🔒 Password:', credentials.password ? '***' : 'VAZIO');

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      console.log('📦 Resposta do servidor:', data);

      if (!response.ok) {
        console.error('❌ Erro do servidor:', data);
        return { success: false, error: data.error || 'Erro ao fazer login' };
      }

      // ✅ CORRIGIDO: Verificar estrutura da resposta
      if (data.success && data.data) {
        const { user: userData, token: userToken } = data.data;

        console.log('✅ Login bem-sucedido!', userData);

        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));

        return { success: true, user: userData, token: userToken };
      } else if (data.token && data.user) {
        // Formato alternativo de resposta
        console.log('✅ Login bem-sucedido (formato alternativo)!', data.user);

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return { success: true, user: data.user, token: data.token };
      }

      return { success: false, error: 'Resposta inválida do servidor' };

    } catch (error) {
      console.error('💥 Erro ao fazer login:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  // ✅ CORRIGIDO: Registro
  const register = async (userData) => {
    try {
      console.log('📝 Tentando cadastro...', userData);

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      console.log('📦 Resposta do servidor:', data);

      if (!response.ok) {
        console.error('❌ Erro do servidor:', data);
        return { success: false, error: data.error || 'Erro ao criar conta' };
      }

      // ✅ Verificar estrutura da resposta
      if (data.success && data.data) {
        const { user: newUser, token: userToken } = data.data;

        console.log('✅ Cadastro bem-sucedido!', newUser);

        setToken(userToken);
        setUser(newUser);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        return { success: true, user: newUser, token: userToken };
      } else if (data.token && data.user) {
        console.log('✅ Cadastro bem-sucedido (formato alternativo)!', data.user);

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return { success: true, user: data.user, token: data.token };
      }

      return { success: false, error: 'Resposta inválida do servidor' };

    } catch (error) {
      console.error('💥 Erro ao registrar:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  // Logout
  const logout = async () => {
    console.log('👋 Fazendo logout...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Atualizar perfil
  const updateProfile = async (profileData) => {
    try {
      console.log('🔄 Atualizando perfil...', profileData);

      const response = await fetch('http://localhost:3001/api/auth/profile/update', {
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

      // Atualizar usuário local
      const updatedUser = data.data?.user || data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      console.log('✅ Perfil atualizado!', updatedUser);

      return { success: true, data: updatedUser };

    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  // ✅ Recarregar dados do usuário
  const refreshUser = async () => {
    try {
      if (!token) {
        console.log('⚠️ Sem token, não é possível recarregar');
        return { success: false, error: 'Não autenticado' };
      }

      console.log('🔄 Recarregando dados do usuário...');
      
      // Tentar buscar do endpoint /auth/profile
      const userResponse = await fetch('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const newUser = userData.data?.user || userData.user || userData.data;

        console.log('✅ Dados recarregados:', newUser);

        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        return { success: true, data: newUser };
      }

      // Se não funcionar, tentar /professionals/me
      console.log('⚠️ /auth/profile não disponível, tentando /professionals/me...');
      
      const profResponse = await fetch('http://localhost:3001/api/professionals/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const profData = await profResponse.json();

      if (!profResponse.ok) {
        return { success: false, error: profData.error || 'Erro ao recarregar dados' };
      }

      // Mesclar dados do profissional com o user atual
      const updatedUser = {
        ...user,
        profile_photo: profData.data?.profile_photo || profData.profile_photo
      };

      console.log('✅ Dados recarregados do profissional:', updatedUser);

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, data: updatedUser };

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
      console.log('🔒 Token expirado, fazendo logout...');
      await logout();
      throw new Error('Sessão expirada');
    }

    return response;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.user_type === 'admin',
    isProfessional: user?.user_type === 'professional',
    isCompany: user?.user_type === 'company',
    isClient: user?.user_type === 'client',
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
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