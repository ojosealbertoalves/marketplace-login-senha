// frontend/src/services/api.js - COM AXIOS E FETCH
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// ===== CONFIGURAÇÃO DO AXIOS =====
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== FUNÇÕES FETCH (mantidas para compatibilidade) =====

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
    return [];
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

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

export const getSubcategories = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subcategories?category_id=${categoryId}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar subcategorias:', error);
    return [];
  }
};

export const getCities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cities`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return [];
  }
};

export const getStates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cities/states`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    return [];
  }
};

// ===== OBJETO API COM FUNÇÕES FETCH (compatibilidade) =====
export const apiService = {
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

// ===== EXPORT DEFAULT DO AXIOS (para Profile.jsx) =====
export default axiosInstance;