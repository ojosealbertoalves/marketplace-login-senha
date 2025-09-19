import { useState, useMemo } from 'react';

export const useFilters = (professionals, categories) => {
  const [filters, setFilters] = useState({
    name: '',
    category: '', // Agora vai armazenar o ID da categoria
    subcategory: '',
    state: '',
    city: ''
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'category' && { subcategory: '' }), // Limpa subcategoria quando muda categoria
      ...(key === 'state' && { city: '' }) // Limpa cidade quando muda estado
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      category: '',
      subcategory: '',
      state: '',
      city: ''
    });
  };

  // Obter subcategorias da categoria selecionada
  const availableSubcategories = useMemo(() => {
    if (!filters.category || !categories) return [];
    
    // Encontrar a categoria pelo ID
    const selectedCategory = categories.find(cat => cat.id === filters.category);
    return selectedCategory ? selectedCategory.subcategories || [] : [];
  }, [filters.category, categories]);

  // Obter estados únicos dos profissionais
  const availableStates = useMemo(() => {
    if (!professionals) return [];
    const states = [...new Set(professionals.map(prof => prof.state).filter(Boolean))];
    return states.sort();
  }, [professionals]);

  // Obter cidades do estado selecionado
  const availableCities = useMemo(() => {
    if (!professionals || !filters.state) return [];
    const cities = professionals
      .filter(prof => prof.state === filters.state)
      .map(prof => prof.city)
      .filter(Boolean);
    return [...new Set(cities)].sort();
  }, [professionals, filters.state]);

  // Função auxiliar para encontrar categoria por ID
  const getCategoryById = (categoryId) => {
    return categories?.find(cat => cat.id === categoryId);
  };

  // Filtrar profissionais baseado nos filtros ativos
  const filteredProfessionals = useMemo(() => {
    if (!professionals) return [];

    return professionals.filter(professional => {
      // Filtro por nome
      if (filters.name && !professional.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      // Filtro por categoria - Comparar usando o nome da categoria
      if (filters.category) {
        const selectedCategory = getCategoryById(filters.category);
        if (!selectedCategory) return false;
        
        // Comparar com o nome da categoria que vem da API
        const categoryNameFromAPI = professional.category;
        const selectedCategoryName = selectedCategory.nameWithIcon || selectedCategory.name;
        
        if (categoryNameFromAPI !== selectedCategoryName) {
          return false;
        }
      }

      // Filtro por subcategoria
      if (filters.subcategory) {
        let hasSubcategory = false;
        
        // Verificar se existe no array de subcategorias (novo formato)
        if (professional.subcategories && Array.isArray(professional.subcategories)) {
          hasSubcategory = professional.subcategories.some(sub => {
            // Pode ser objeto ou string
            const subName = typeof sub === 'object' ? sub.name : sub;
            return subName === filters.subcategory;
          });
        }
        
        // Verificar formato legado (campo subcategory único)
        if (!hasSubcategory && professional.subcategory === filters.subcategory) {
          hasSubcategory = true;
        }
        
        if (!hasSubcategory) {
          return false;
        }
      }

      // Filtro por estado
      if (filters.state && professional.state !== filters.state) {
        return false;
      }

      // Filtro por cidade
      if (filters.city && professional.city !== filters.city) {
        return false;
      }

      return true;
    });
  }, [professionals, filters, categories]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== '');
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredProfessionals,
    availableSubcategories,
    availableStates,
    availableCities,
    hasActiveFilters,
    getCategoryById // Exportar para uso no componente se necessário
  };
};