import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // URL completa do backend
  timeout: 10000,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
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

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (err) => {
    console.error('Erro na API:', err);
    
    // Se token expirou, limpar localStorage
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(err);
  }
);

export const apiService = {
  // Buscar todos os profissionais
  getProfessionals: async () => {
    try {
      const response = await api.get('/professionals');
      console.log('Resposta getProfessionals:', response.data); // Debug
      
      // Backend retorna { success: true, data: [...] }
      if (response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (err) {
      console.error('Erro em getProfessionals:', err);
      throw new Error('Erro ao buscar profissionais');
    }
  },

  // Buscar profissional por ID
  getProfessionalById: async (id) => {
    try {
      const response = await api.get(`/professionals/${id}`);
      console.log('Resposta getProfessionalById:', response.data); // Debug
      
      // Backend retorna { success: true, data: {...} }
      if (response.data.success) {
        const professional = response.data.data;
        
        // Mapear nomes de campos do backend para frontend
        return {
          id: professional.id,
          name: professional.name,
          email: professional.email,
          photo: professional.profile_photo,
          category: professional.category?.name || 'Não informado',
          subcategory: professional.subcategories?.[0]?.name || 'Não informado',
          city: professional.cityRelation?.name || professional.city || 'Não informado',
          state: professional.state || 'Não informado',
          description: professional.description,
          experience: professional.experience || 'Não informado',
          education: professional.education || 'Não informado',
          tags: professional.tags || [],
          phone: professional.phone,
          whatsapp: professional.whatsapp,
          socialLinks: professional.social_media || {},
          businessAddress: professional.business_address,
          googleMapsLink: professional.google_maps_link,
          portfolio: professional.portfolio || [],
          registrationDate: professional.created_at,
          contactRestricted: professional.contactRestricted || false,
          referredBy: professional.indicationsReceived?.[0]?.fromProfessional?.name,
          referralDate: professional.indicationsReceived?.[0]?.created_at
        };
      }
      return response.data;
    } catch (err) {
      console.error('Erro em getProfessionalById:', err);
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
  },

  // Verificar se usuário está logado
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obter dados do usuário logado
  getCurrentUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
};

export default api;