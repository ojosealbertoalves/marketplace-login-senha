// frontend/src/components/ProfessionalCard.jsx - SEM ÍCONE DE CHAVE
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

  const handleViewProfile = () => {
    navigate(`/professional/${professional.id}`);
  };

  return (
    <div className="professional-card">
      <div className="professional-card-header">
        <div className="professional-avatar">
          <img
            src={professional.photo || '/placeholder-user.jpg'}
            alt={professional.name}
            onError={(e) => {
              e.target.src = '/placeholder-user.jpg';
            }}
          />
        </div>
        
        <div className="professional-info">
          <h3 className="professional-name">{professional.name}</h3>
          
          {/* Categoria principal */}
          <div className="professional-category">
            <span className="category-icon">
              {getCategoryIcon(professional.category)}
            </span>
            <div className="category-info">
              <span className="category-main">{professional.category}</span>
              {professional.subcategory && (
                <span className="category-sub">{professional.subcategory}</span>
              )}
            </div>
          </div>
          
          {/* Subcategorias adicionais */}
          {professional.subcategories && professional.subcategories.length > 0 && (
            <div className="subcategories-list">
              {professional.subcategories.slice(0, 2).map((sub, index) => (
                <span key={index} className="subcategory-tag">
                  {typeof sub === 'object' ? sub.name : sub}
                </span>
              ))}
              {professional.subcategories.length > 2 && (
                <span className="subcategory-more">
                  +{professional.subcategories.length - 2} mais
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