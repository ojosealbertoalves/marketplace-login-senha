// Importar CSS no topo
import './ProfessionalCard.css';
import React from 'react';
import { MapPin, Calendar, User, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfessionalCard = ({ professional }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/professional/${professional.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Obras e Reformas': '🏗️',
      'Projetos Técnicos': '📐',
      'Arquitetura e Design': '🏠',
      'Pintura e Revestimentos': '🎨',
      'Elétrica': '⚡',
      'Hidráulica': '🚿',
      'Marcenaria e Carpintaria': '🪚',
      'Serralheria e Metais': '🔩',
      'Regularização e Documentação': '🧾',
      'Outros Serviços Complementares': '🧰',
      'Gráfica': '🖨️'
    };
    return iconMap[category] || '🔧';
  };

  return (
    <div 
      className="professional-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Ver perfil de ${professional.name}`}
    >
      {/* Header com foto e informações básicas */}
      <div className="card-header">
        <div className="avatar-container">
          <img
            src={professional.photo || '/placeholder-user.jpg'}
            alt={`Foto de ${professional.name}`}
            className="professional-avatar"
            onError={(e) => {
              e.target.src = '/placeholder-user.jpg';
            }}
          />
        </div>
        
        <div className="professional-info">
          <h3 className="professional-name">
            {professional.name}
          </h3>
          
          <div className="category-section">
            <span className="category-icon">
              {getCategoryIcon(professional.category)}
            </span>
            <span className="subcategory-text">
              {professional.subcategory}
            </span>
          </div>
          
          <div className="location-section">
            <MapPin className="location-icon" />
            <span className="location-text">
              {professional.city}, {professional.state}
            </span>
          </div>
        </div>
      </div>

      {/* Indicação (se houver) */}
      {professional.referredBy && (
        <div className="referral-section">
          <div className="referral-content">
            <User className="referral-icon" />
            <span className="referral-label">
              Indicado por:
            </span>
            <span className="referral-name">
              {professional.referredBy}
            </span>
          </div>
        </div>
      )}

      {/* Tags */}
      {professional.tags && professional.tags.length > 0 && (
        <div className="tags-section">
          <div className="tags-header">
            <Tag className="tags-icon" />
            <span className="tags-label">Especialidades:</span>
          </div>
          <div className="tags-container">
            {professional.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="tag-item"
                title={tag}
              >
                {tag}
              </span>
            ))}
            {professional.tags.length > 3 && (
              <span 
                className="tag-item tag-more"
                title={`${professional.tags.length - 3} especialidades adicionais`}
              >
                +{professional.tags.length - 3} mais
              </span>
            )}
          </div>
        </div>
      )}

      {/* Experiência (resumida) */}
      <div className="experience-section">
        <p className="experience-text">
          {professional.experience}
        </p>
      </div>

      {/* Footer com data de cadastro */}
      <div className="card-footer">
        <div className="registration-date">
          <Calendar className="calendar-icon" />
          <span className="date-text">
            Desde {formatDate(professional.registrationDate)}
          </span>
        </div>
        
        <button 
          className="view-profile-button"
          onClick={(e) => {
            e.stopPropagation(); // Evita conflito com o click do card
            handleCardClick();
          }}
          aria-label={`Ver perfil completo de ${professional.name}`}
        >
          Ver perfil →
        </button>
      </div>
    </div>
  );
};

export default ProfessionalCard;