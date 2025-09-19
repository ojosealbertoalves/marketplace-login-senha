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
  // Buscar todos os profissionais
  getProfessionals: async () => {
    try {
      const response = await api.get('/professionals');
      return response.data;
    } catch (err) {
      throw new Error('Erro ao buscar profissionais');
    }
  },

  // Buscar profissional por ID
  getProfessionalById: async (id) => {
    try {
      const response = await api.get(`/professionals/${id}`);
      return response.data;
    } catch (err) {
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