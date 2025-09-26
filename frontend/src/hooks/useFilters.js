// frontend/src/hooks/useFilters.js - CORRIGIDO
import { useState, useMemo } from 'react';

export const useFilters = (professionals = [], categories = []) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subcategory: '',
    state: '',
    city: ''
  });

  // Garantir que os dados sejam arrays
  const safeProfessionals = useMemo(() => {
    if (!professionals) return [];
    if (Array.isArray(professionals)) return professionals;
    if (professionals.data && Array.isArray(professionals.data)) return professionals.data;
    return [];
  }, [professionals]);

  const safeCategories = useMemo(() => {
    if (!categories) return [];
    if (Array.isArray(categories)) return categories;
    if (categories.data && Array.isArray(categories.data)) return categories.data;
    return [];
  }, [categories]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Limpar subcategoria quando categoria muda
      ...(key === 'category' && { subcategory: '' })
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      subcategory: '',
      state: '',
      city: ''
    });
  };

  // Profissionais filtrados
  const filteredProfessionals = useMemo(() => {
    return safeProfessionals.filter(professional => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = professional.name?.toLowerCase().includes(searchLower);
        const matchesCategory = professional.category?.toLowerCase().includes(searchLower);
        const matchesSubcategory = professional.subcategory?.toLowerCase().includes(searchLower);
        const matchesDescription = professional.description?.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesCategory && !matchesSubcategory && !matchesDescription) {
          return false;
        }
      }

      // Filtro de categoria
      if (filters.category) {
        // Buscar pela categoria atual ou pelo categoryId
        const matchesCategory = professional.category === filters.category || 
                              professional.categoryId === filters.category ||
                              professional.category_id === filters.category;
        if (!matchesCategory) return false;
      }

      // Filtro de subcategoria - CORRIGIDO
      if (filters.subcategory) {
        // Verificar se o professional tem essa subcategoria
        const hasSubcategory = 
          professional.subcategory === filters.subcategory ||
          (professional.subcategories && Array.isArray(professional.subcategories) && 
           professional.subcategories.some(sub => 
             sub === filters.subcategory || 
             sub.id === filters.subcategory || 
             sub.name === filters.subcategory
           ));
        
        if (!hasSubcategory) return false;
      }

      // Filtro de estado
      if (filters.state && professional.state !== filters.state) {
        return false;
      }

      // Filtro de cidade
      if (filters.city && professional.city !== filters.city) {
        return false;
      }

      return true;
    });
  }, [safeProfessionals, filters]);

  // Subcategorias disponíveis baseadas na categoria selecionada
  const availableSubcategories = useMemo(() => {
    if (!filters.category) return [];
    
    const selectedCategory = safeCategories.find(cat => 
      cat.id === filters.category || cat.name === filters.category
    );
    
    return selectedCategory?.subcategories || [];
  }, [safeCategories, filters.category]);

  // Estados únicos dos profissionais
  const availableStates = useMemo(() => {
    const states = safeProfessionals
      .map(p => p.state)
      .filter(Boolean)
      .filter((state, index, self) => self.indexOf(state) === index)
      .sort();
    return states;
  }, [safeProfessionals]);

  // Cidades únicas baseadas no estado selecionado
  const availableCities = useMemo(() => {
    const professionalsInState = filters.state 
      ? safeProfessionals.filter(p => p.state === filters.state)
      : safeProfessionals;
    
    const cities = professionalsInState
      .map(p => p.city)
      .filter(Boolean)
      .filter((city, index, self) => self.indexOf(city) === index)
      .sort();
    return cities;
  }, [safeProfessionals, filters.state]);

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredProfessionals,
    availableSubcategories,
    availableStates,
    availableCities,
    hasActiveFilters
  };
};