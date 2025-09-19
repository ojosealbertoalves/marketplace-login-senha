// IMPORTANTE: Importar CSS primeiro
import './Home.css';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Search, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { useFilters } from '../hooks/useFilters';
import Filters from '../components/Filters';
import ProfessionalCard from '../components/ProfessionalCard';

const Home = () => {
  const [professionals, setProfessionals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true); // Novo estado

  const {
    filters,
    updateFilter,
    clearFilters,
    filteredProfessionals,
    availableSubcategories,
    availableStates,
    availableCities,
    hasActiveFilters
  } = useFilters(professionals, categories);

  // Memoizar dados pesados
  const memoizedProfessionals = useMemo(() => filteredProfessionals, [filteredProfessionals]);

  // Carregar dados com melhores práticas
  useEffect(() => {
    let isMounted = true; // Previne updates se componente foi desmontado

    const loadData = async () => {
      try {
        // Não mostrar loading se já temos dados
        if (professionals.length === 0) {
          setLoading(true);
        }

        const [professionalsData, categoriesData] = await Promise.all([
          apiService.getProfessionals(),
          apiService.getCategories()
        ]);
        
        // Só atualizar se componente ainda está montado
        if (isMounted) {
          setProfessionals(professionalsData);
          setCategories(categoriesData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Erro ao carregar dados. Tente novamente.');
          console.error('Erro ao carregar dados:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    loadData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [professionals.length]);

  // Callback otimizado para retry
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    // Forçar reload removendo dados existentes
    setProfessionals([]);
  }, []);

  // Loading skeleton em vez de spinner
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="header-gradient">
        <div className="container py-6">
          <div className="text-center">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="filters-section">
          <div className="skeleton-filters"></div>
        </div>

        <div className="skeleton-results-header"></div>
        
        <div className="professionals-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </main>
    </div>
  );

  // Mostrar skeleton apenas no carregamento inicial
  if (initialLoad && loading) {
    return <LoadingSkeleton />;
  }

  // Error state otimizado
  if (error && professionals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="header-gradient">
          <div className="container py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                🏗️ Marketplace da Construção Civil
              </h1>
              <p className="text-gray-200 max-w-2xl mx-auto">
                Encontre os melhores profissionais da construção civil da sua região.
              </p>
            </div>
          </div>
        </header>

        <main className="container py-8">
          <div className="error-container">
            <div className="error-content">
              <AlertCircle className="error-icon" />
              <h2 className="error-title">Ops! Algo deu errado</h2>
              <p className="error-message">{error}</p>
              <button 
                onClick={handleRetry}
                className="retry-btn"
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Tentar novamente'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header-gradient">
        <div className="container py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              🏗️ Marketplace da Construção Civil
            </h1>
            <p className="text-gray-200 max-w-2xl mx-auto">
              Encontre os melhores profissionais da construção civil da sua região. 
              Conectamos você com especialistas qualificados e experientes.
            </p>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container py-8">
        {/* Filtros */}
        <section className="filters-section">
          <Filters
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            categories={categories}
            availableSubcategories={availableSubcategories}
            availableStates={availableStates}
            availableCities={availableCities}
            hasActiveFilters={hasActiveFilters}
          />
        </section>

        {/* Resultados */}
        <section>
          <div className="results-header">
            <div className="results-title">
              <Users className="h-5 w-5 text-primary-600" />
              <h2>Profissionais Encontrados</h2>
              <span className="results-count">
                {memoizedProfessionals.length}
              </span>
            </div>
            
            {hasActiveFilters && (
              <p className="results-info">
                Mostrando resultados filtrados
              </p>
            )}
          </div>

          {/* Loading indicator sutil para re-carregamentos */}
          {loading && professionals.length > 0 && (
            <div className="loading-overlay">
              <div className="loading-spinner-small"></div>
            </div>
          )}

          {/* Lista de profissionais */}
          {memoizedProfessionals.length === 0 && !loading ? (
            <div className="empty-container">
              <div className="empty-content">
                <Search className="empty-icon" />
                <h3 className="empty-title">
                  Nenhum profissional encontrado
                </h3>
                <p className="empty-message">
                  {hasActiveFilters 
                    ? 'Tente ajustar os filtros para encontrar mais resultados.'
                    : 'Não há profissionais cadastrados no momento.'
                  }
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="clear-filters-btn"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="professionals-grid">
              {memoizedProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;