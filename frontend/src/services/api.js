// frontend/src/services/api.js - CORRIGIDO
const API_BASE_URL = 'http://localhost:3001/api';

// ===== AUTENTICAÇÃO =====

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || 'Erro ao cadastrar usuário' 
      };
    }

    return { success: true, ...data };
  } catch (error) {
    console.error('Erro no registro:', error);
    return { 
      success: false, 
      error: 'Erro de conexão. Tente novamente.' 
    };
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || 'Erro ao fazer login' 
      };
    }

    return { success: true, ...data };
  } catch (error) {
    console.error('Erro no login:', error);
    return { 
      success: false, 
      error: 'Erro de conexão. Tente novamente.' 
    };
  }
};

export const checkEmail = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/check?email=${email}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    throw error;
  }
};

// ===== PROFISSIONAIS =====

export const getProfessionals = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}/professionals`, { headers });
    const data = await response.json();
    
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    throw error;
  }
};

export const getProfessionalById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}/professionals/${id}`, { headers });
    const data = await response.json();
    
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    throw error;
  }
};

// ===== CATEGORIAS =====

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

export const getSubcategories = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories?category_id=${categoryId}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar subcategorias:', error);
    throw error;
  }
};

// ===== CIDADES =====

export const getCities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cities`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    throw error;
  }
};

export const getStates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cities/states`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    throw error;
  }
};

// Export default para compatibilidade
export default {
  register,
  login,
  checkEmail,
  getProfessionals,
  getProfessionalById,
  getCategories,
  getSubcategories,
  getCities,
  getStates
};