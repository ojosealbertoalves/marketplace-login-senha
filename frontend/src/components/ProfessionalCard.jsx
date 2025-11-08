// frontend/src/components/ProfessionalCard.jsx - VERSÃO CORRIGIDA MANTENDO SEU ESTILO
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye } from 'lucide-react';
import './ProfessionalCard.css';

const ProfessionalCard = ({ professional }) => {
  const navigate = useNavigate();

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Obras e Reformas': '🏗️',
      'Arquitetura e Design': '🏠', 
      'Pintura e Revestimentos': '🎨',
      'Elétrica': '⚡',
      'Hidráulica': '🚿',
      'Marcenaria e Carpintaria': '🪚',
      'Serralheria e Metais': '🔩',
      'Regularização e Documentação': '📋',
      'Outros Serviços': '🔧'
    };
    return iconMap[category] || '🔧';
  };

  // ✅ CORREÇÃO: Extrair nome da categoria de forma segura
  const getCategoryName = () => {
    if (!professional.category) return 'Sem categoria';
    // Se for string, retorna direto
    if (typeof professional.category === 'string') return professional.category;
    // Se for objeto com name, retorna o name
    if (typeof professional.category === 'object' && professional.category.name) {
      return professional.category.name;
    }
    return 'Sem categoria';
  };

  // ✅ CORREÇÃO: Extrair subcategoria principal de forma segura
  const getSubcategoryName = () => {
    if (!professional.subcategory) return null;
    if (typeof professional.subcategory === 'string') return professional.subcategory;
    if (typeof professional.subcategory === 'object' && professional.subcategory.name) {
      return professional.subcategory.name;
    }
    return null;
  };

  // ✅ CORREÇÃO: Processar array de subcategorias de forma segura
  const getSubcategoriesArray = () => {
    if (!professional.subcategories || !Array.isArray(professional.subcategories)) {
      return [];
    }
    return professional.subcategories.map(sub => 
      typeof sub === 'object' ? sub.name : sub
    ).filter(Boolean);
  };

  const categoryName = getCategoryName();
  const subcategoryName = getSubcategoryName();
  const subcategoriesArray = getSubcategoriesArray();

  const handleViewProfile = () => {
    navigate(`/professional/${professional.id}`);
  };

  return (
    <div className="professional-card">
      <div className="professional-card-header">
        <div className="professional-avatar">
          <img
            src={
              professional.profile_photo ||
              professional.photo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&size=200&background=0D8ABC&color=fff`
            }
            alt={professional.name}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&size=200&background=0D8ABC&color=fff`;
            }}
          />
        </div>
        
        <div className="professional-info">
          <h3 className="professional-name">{professional.name}</h3>
          
          {/* Categoria principal - ✅ USANDO VALOR SEGURO */}
          <div className="professional-category">
            <span className="category-icon">
              {getCategoryIcon(categoryName)}
            </span>
            <div className="category-info">
              <span className="category-main">{categoryName}</span>
              {subcategoryName && (
                <span className="category-sub">{subcategoryName}</span>
              )}
            </div>
          </div>
          
          {/* Subcategorias adicionais - ✅ USANDO ARRAY SEGURO */}
          {subcategoriesArray.length > 0 && (
            <div className="subcategories-list">
              {subcategoriesArray.slice(0, 2).map((sub, index) => (
                <span key={index} className="subcategory-tag">
                  {sub}
                </span>
              ))}
              {subcategoriesArray.length > 2 && (
                <span className="subcategory-more">
                  +{subcategoriesArray.length - 2} mais
                </span>
              )}
            </div>
          )}
          
          <div className="professional-location">
            <MapPin size={14} />
            <span>{professional.city}, {professional.state}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {professional.tags && professional.tags.length > 0 && (
        <div className="professional-tags">
          {professional.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
          {professional.tags.length > 3 && (
            <span className="tag-more">
              +{professional.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Descrição */}
      {professional.description && (
        <p className="professional-description">
          {professional.description.length > 100
            ? `${professional.description.substring(0, 100)}...`
            : professional.description
          }
        </p>
      )}

      {/* Botão ver perfil */}
      <div className="professional-actions">
        <button
          onClick={handleViewProfile}
          className="view-profile-btn"
        >
          <Eye size={16} />
          Ver Perfil Completo
        </button>
      </div>
    </div>
  );
};

export default ProfessionalCard;