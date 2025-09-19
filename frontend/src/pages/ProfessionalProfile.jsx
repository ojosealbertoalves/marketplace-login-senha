import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Tag, 
  GraduationCap, 
  Briefcase,
  Phone,
  Instagram,
  Youtube,
  Globe,
  ExternalLink,
  Linkedin,
  Image,
  Clock,
  Ruler,
  ChevronLeft,
  ChevronRight,
  X,
  Award
} from 'lucide-react';
import { apiService } from '../services/api';
import './ProfessionalProfile.css';

const ProfessionalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadProfessional = async () => {
      try {
        setLoading(true);
        const data = await apiService.getProfessionalById(id);
        setProfessional(data);
      } catch (err) {
        setError('Profissional não encontrado');
        console.error('Erro ao carregar profissional:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProfessional();
    }
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatProjectDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    });
  };

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

  const handleWhatsAppClick = () => {
    const message = `Olá ${professional.name}! Vi seu perfil no Marketplace da Construção Civil e gostaria de solicitar um orçamento.`;
    const whatsappUrl = `https://wa.me/55${professional.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject && selectedProject.images) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % selectedProject.images.length
      );
    }
  };

  const prevImage = () => {
    if (selectedProject && selectedProject.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando perfil do profissional...</p>
        </div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2 className="error-title">Profissional não encontrado</h2>
          <p className="error-message">
            O profissional que você está procurando não existe ou foi removido.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Voltar à página inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header com botão voltar */}
      <header className="profile-header">
        <div className="header-content">
          <button
            onClick={() => navigate('/')}
            className="back-button"
          >
            <ArrowLeft size={20} />
            <span>Voltar aos profissionais</span>
          </button>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-grid">
          {/* Coluna principal */}
          <div className="main-column">
            
            {/* Card principal do profissional */}
            <div className="profile-card">
              <div className="profile-header-card">
                <div className="profile-image-container">
                  <img
                    src={professional.photo || '/placeholder-user.jpg'}
                    alt={professional.name}
                    className="profile-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-user.jpg';
                    }}
                  />
                </div>
                
                <div className="profile-info">
                  <h1 className="profile-name">{professional.name}</h1>
                  
                  <div className="profile-category">
                    <span className="category-icon">
                      {getCategoryIcon(professional.category)}
                    </span>
                    <div>
                      <p className="subcategory">{professional.subcategory}</p>
                      <p className="category">{professional.category}</p>
                    </div>
                  </div>
                  
                  <div className="profile-meta">
                    <div className="meta-item">
                      <MapPin size={16} />
                      <span>{professional.city}, {professional.state}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>Cadastrado desde {formatDate(professional.registrationDate)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {professional.tags && professional.tags.length > 0 && (
                    <div className="profile-tags">
                      {professional.tags.map((tag, index) => (
                        <span key={index} className="tag-badge">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Indicação */}
            {professional.indicationsReceived && professional.indicationsReceived.length > 0 && (
              <div className="indication-card">
                <div className="indication-header">
                  <Award size={20} />
                  <h3>Profissional Indicado</h3>
                </div>
                <p className="indication-text">
                  Indicado por <strong>{professional.indicationsReceived[0].professionalName}</strong>
                </p>
                <p className="indication-date">
                  em {formatDate(professional.indicationsReceived[0].date)}
                </p>
              </div>
            )}

            {/* Formação e Experiência */}
            <div className="info-card">
              <div className="info-section">
                <div className="section-header">
                  <GraduationCap size={20} />
                  <h3>Formação</h3>
                </div>
                <p className="section-content">{professional.education}</p>
              </div>
              
              <div className="info-section">
                <div className="section-header">
                  <Briefcase size={20} />
                  <h3>Experiência</h3>
                </div>
                <p className="section-content">{professional.experience}</p>
              </div>
            </div>

            {/* Portfolio de Projetos */}
            {professional.portfolio && professional.portfolio.length > 0 && (
              <div className="portfolio-card">
                <div className="portfolio-header">
                  <div className="section-header">
                    <Image size={20} />
                    <h3>Portfolio de Projetos</h3>
                  </div>
                  <span className="project-count">
                    {professional.portfolio.length} {professional.portfolio.length === 1 ? 'projeto' : 'projetos'}
                  </span>
                </div>
                
                <div className="portfolio-grid">
                  {professional.portfolio.map((project) => (
                    <div 
                      key={project.id} 
                      className="project-card"
                      onClick={() => openProjectModal(project)}
                    >
                      <div className="project-image-container">
                        <img
                          src={project.images && project.images[0] ? project.images[0] : '/placeholder-project.jpg'}
                          alt={project.title}
                          className="project-image"
                          onError={(e) => {
                            e.target.src = '/placeholder-project.jpg';
                          }}
                        />
                        {project.images && project.images.length > 1 && (
                          <div className="image-count">
                            <Image size={14} />
                            <span>{project.images.length}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="project-content">
                        <h4 className="project-title">{project.title}</h4>
                        <p className="project-description">{project.description}</p>
                        
                        <div className="project-details">
                          {project.area && (
                            <div className="detail-item">
                              <Ruler size={14} />
                              <span>{project.area}</span>
                            </div>
                          )}
                          {project.duration && (
                            <div className="detail-item">
                              <Clock size={14} />
                              <span>{project.duration}</span>
                            </div>
                          )}
                          {project.completedAt && (
                            <div className="detail-item">
                              <Calendar size={14} />
                              <span>{formatProjectDate(project.completedAt)}</span>
                            </div>
                          )}
                        </div>
                        
                        {project.projectType && (
                          <div className="project-type">
                            {project.projectType}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            {/* Botão WhatsApp */}
            <div className="whatsapp-card">
              <button
                onClick={handleWhatsAppClick}
                className="whatsapp-button"
              >
                <Phone size={20} />
                <span>Solicitar Orçamento</span>
              </button>
              <p className="whatsapp-text">
                Conversa direta via WhatsApp
              </p>
            </div>

            {/* Informações de Contato */}
            <div className="contact-card">
              <h3 className="card-title">Informações de Contato</h3>
              
              <div className="contact-list">
                <div className="contact-item">
                  <Phone size={18} />
                  <div>
                    <p className="contact-label">WhatsApp</p>
                    <p className="contact-value">{professional.whatsapp}</p>
                  </div>
                </div>
                
                {professional.businessAddress && (
                  <div className="contact-item">
                    <MapPin size={18} />
                    <div>
                      <p className="contact-label">Endereço</p>
                      <p className="contact-value">{professional.businessAddress}</p>
                      {professional.googleMapsLink && (
                        <a
                          href={professional.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="maps-link"
                        >
                          Ver no Google Maps
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Redes Sociais */}
            {professional.socialLinks && Object.values(professional.socialLinks).some(link => link) && (
              <div className="social-card">
                <h3 className="card-title">Redes Sociais</h3>
                
                <div className="social-list">
                  {professional.socialLinks.instagram && (
                    <a
                      href={professional.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <Instagram size={18} />
                      <span>Instagram</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                  
                  {professional.socialLinks.linkedin && (
                    <a
                      href={professional.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <Linkedin size={18} />
                      <span>LinkedIn</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                  
                  {professional.socialLinks.youtube && (
                    <a
                      href={professional.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <Youtube size={18} />
                      <span>YouTube</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                  
                  {professional.socialLinks.website && (
                    <a
                      href={professional.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <Globe size={18} />
                      <span>Website</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Modal de Projeto */}
      {selectedProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={24} />
            </button>
            
            <div className="modal-body">
              {selectedProject.images && selectedProject.images.length > 0 && (
                <div className="modal-gallery">
                  <img
                    src={selectedProject.images[currentImageIndex]}
                    alt={selectedProject.title}
                    className="modal-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-project.jpg';
                    }}
                  />
                  
                  {selectedProject.images.length > 1 && (
                    <>
                      <button className="gallery-nav gallery-prev" onClick={prevImage}>
                        <ChevronLeft size={24} />
                      </button>
                      <button className="gallery-nav gallery-next" onClick={nextImage}>
                        <ChevronRight size={24} />
                      </button>
                      
                      <div className="gallery-indicators">
                        {selectedProject.images.map((_, index) => (
                          <button
                            key={index}
                            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className="modal-info">
                <h2 className="modal-title">{selectedProject.title}</h2>
                
                {selectedProject.projectType && (
                  <span className="modal-type">{selectedProject.projectType}</span>
                )}
                
                <p className="modal-description">{selectedProject.description}</p>
                
                <div className="modal-details">
                  {selectedProject.area && (
                    <div className="modal-detail">
                      <Ruler size={16} />
                      <span>Área: {selectedProject.area}</span>
                    </div>
                  )}
                  {selectedProject.duration && (
                    <div className="modal-detail">
                      <Clock size={16} />
                      <span>Duração: {selectedProject.duration}</span>
                    </div>
                  )}
                  {selectedProject.completedAt && (
                    <div className="modal-detail">
                      <Calendar size={16} />
                      <span>Concluído em: {formatProjectDate(selectedProject.completedAt)}</span>
                    </div>
                  )}
                </div>
                
                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <div className="modal-tags">
                    {selectedProject.tags.map((tag, index) => (
                      <span key={index} className="modal-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalProfile;