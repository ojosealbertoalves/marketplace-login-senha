// Importar o CSS no topo
import './Filters.css';
import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const Filters = ({
  filters,
  updateFilter,
  clearFilters,
  categories,
  availableSubcategories,
  availableStates,
  availableCities,
  hasActiveFilters
}) => {
  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="filters-container">
      <div className="filters-header">
        <div className="filters-title-section">
          <Filter className="filter-icon" />
          <h2 className="filters-title">Filtros de Busca</h2>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="clear-filters-button"
            aria-label="Limpar todos os filtros"
          >
            <X className="clear-icon" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>

      <div className="filters-grid">
        {/* Filtro por Nome - CORRIGIDO: usar search em vez de name */}
        <div className={`filter-field ${filters.search ? 'has-value' : ''}`}>
          <label className="filter-label" htmlFor="search-filter">
            Nome do Profissional
          </label>
          <div className="search-input-container">
            <Search className="search-icon" />
            <input
              id="search-filter"
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Buscar por nome..."
              className="input-field"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Filtro por Categoria - AGORA USANDO ID */}
        <div className={`filter-field ${filters.category ? 'has-value' : ''}`}>
          <label className="filter-label" htmlFor="category-filter">
            Categoria
          </label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="select-field"
          >
            <option value="">Todas as categorias</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameWithIcon || category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Subcategoria */}
        <div className={`filter-field ${filters.subcategory ? 'has-value' : ''}`}>
          <label className="filter-label" htmlFor="subcategory-filter">
            Subcategoria
            {filters.category && availableSubcategories.length === 0 && (
              <span className="filter-helper-text"> (nenhuma disponível)</span>
            )}
          </label>
          <select
            id="subcategory-filter"
            value={filters.subcategory}
            onChange={(e) => updateFilter('subcategory', e.target.value)}
            className="select-field"
            disabled={!filters.category || availableSubcategories.length === 0}
          >
            <option value="">
              {!filters.category 
                ? "Selecione uma categoria primeiro" 
                : "Todas as subcategorias"}
            </option>
            {availableSubcategories?.map((subcategory) => (
              <option key={subcategory.id || subcategory.name} value={subcategory.name || subcategory}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Estado */}
        <div className={`filter-field ${filters.state ? 'has-value' : ''}`}>
          <label className="filter-label" htmlFor="state-filter">
            Estado
          </label>
          <select
            id="state-filter"
            value={filters.state}
            onChange={(e) => updateFilter('state', e.target.value)}
            className="select-field"
          >
            <option value="">Todos os estados</option>
            {availableStates?.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Cidade */}
        <div className={`filter-field ${filters.city ? 'has-value' : ''}`}>
          <label className="filter-label" htmlFor="city-filter">
            Cidade
            {filters.state && availableCities.length === 0 && (
              <span className="filter-helper-text"> (nenhuma disponível)</span>
            )}
          </label>
          <select
            id="city-filter"
            value={filters.city}
            onChange={(e) => updateFilter('city', e.target.value)}
            className="select-field"
            disabled={!filters.state || availableCities.length === 0}
          >
            <option value="">
              {!filters.state 
                ? "Selecione um estado primeiro" 
                : "Todas as cidades"}
            </option>
            {availableCities?.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filters-footer">
        <p className="filters-status">
          {hasActiveFilters ? (
            <>
              <span>Filtros ativos: </span>
              <span className="active-filters-count">
                {activeFiltersCount}
              </span>
            </>
          ) : (
            'Nenhum filtro aplicado'
          )}
        </p>
      </div>
    </div>
  );
};

export default Filters;