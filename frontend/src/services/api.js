// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (err) => {
    console.error('Erro na API:', err);
    return Promise.reject(err);
  }
);

export const apiService = {
  // ===== AUTENTICAÇÃO ===== (NOVAS FUNÇÕES)
  
  // Registrar novo usuário
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao cadastrar usuário';
      throw new Error(errorMessage);
    }
  },

  // Login de usuário
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  },

  // Verificar se email já existe
  checkEmail: async (email) => {
    try {
      const response = await api.get(`/users/check?email=${email}`);
      return response.data;
    } catch (err) {
      throw new Error('Erro ao verificar email');
    }
  },

  // ===== PROFISSIONAIS ===== (FUNÇÕES EXISTENTES)
  
  // Buscar todos os profissionais
  getProfessionals: async () => {
  try {
    const token = localStorage.getItem('token');
    const config = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};
    
    const response = await api.get('/professionals', config);
    
    // Retorna só o array de profissionais
    return response.data.data; // ← Correção aqui também
  } catch (err) {
    throw new Error('Erro ao buscar profissionais');
  }
},

  // Buscar profissional por ID
 
getProfessionalById: async (id) => {
  try {
    // Adicionar token se existir
    const token = localStorage.getItem('token');
    const config = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};
    
    const response = await api.get(`/professionals/${id}`, config);
    
    // A API retorna { success: true, data: {...}, meta: {...} }
    // Então precisamos retornar response.data.data
    console.log('Resposta da API:', response.data);
    
    return response.data.data; // ← Retorna só os dados
  } catch (err) {
    console.error('Erro ao buscar profissional:', err);
    throw new Error('Erro ao buscar profissional');
  }
},
  // Buscar todas as categorias
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (err) {
      throw new Error('Erro ao buscar categorias');
    }
  },

  // Buscar cidades
  getCities: async () => {
    try {
      const response = await api.get('/cities');
      return response.data;
    } catch (err) {
      throw new Error('Erro ao buscar cidades');
    }
  },

  // Filtrar profissionais
  filterProfessionals: async (filters) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/professionals/search?${params.toString()}`);
      return response.data;
    } catch (err) {
      throw new Error('Erro ao filtrar profissionais');
    }
  }
};

export default api;