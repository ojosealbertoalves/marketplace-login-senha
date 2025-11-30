// frontend/src/hooks/useFilters.js - CORRIGIDO SIMPLES
import { useState, useMemo } from 'react';

export const useFilters = (professionals = [], categories = []) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subcategory: '',
    state: '',
    city: ''
  });

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
      ...(key === 'category' && { subcategory: '' }),
      ...(key === 'state' && { city: '' })
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
    // 🔍 DEBUG - REMOVER DEPOIS
    console.log('🔍 DEBUG FILTROS:', {
      filters,
      totalProfessionals: safeProfessionals.length,
      primeiroProfissional: safeProfessionals[0]
    });
    
    return safeProfessionals.filter(professional => {
      // 🔍 DEBUG - REMOVER DEPOIS
      if (filters.category) {
        console.log('🔍 Comparando:', {
          professional_category_id: professional.category_id,
          filters_category: filters.category,
          match: professional.category_id === filters.category
        });
      }
      
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = professional.name?.toLowerCase().includes(searchLower);
        
        const categoryName = typeof professional.category === 'object' 
          ? professional.category?.name 
          : professional.category;
        const matchesCategory = categoryName?.toLowerCase().includes(searchLower);
        
        const matchesDescription = professional.description?.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesCategory && !matchesDescription) {
          return false;
        }
      }

      // ✅ FILTRO DE CATEGORIA SIMPLIFICADO
      if (filters.category) {
        if (professional.category_id !== filters.category) {
          return false;
        }
      }

      // Filtro de subcategoria
      if (filters.subcategory) {
        if (!professional.subcategories || !Array.isArray(professional.subcategories)) {
          return false;
        }
        
        const hasSubcategory = professional.subcategories.some(sub => {
          if (typeof sub === 'string') {
            return sub === filters.subcategory;
          }
          return sub.name === filters.subcategory || sub.id === filters.subcategory;
        });
        
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
    
    const selectedCategory = safeCategories.find(cat => cat.id === filters.category);
    
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