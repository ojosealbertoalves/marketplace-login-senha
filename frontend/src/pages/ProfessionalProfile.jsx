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
        setError(null);
        
        // Verificar se o ID é válido
        if (!id) {
          throw new Error('ID do profissional não fornecido');
        }

        console.log('Carregando profissional com ID:', id);
        
        const data = await apiService.getProfessionalById(id);
        
        console.log('Dados recebidos:', data);
        
        // Verificar se os dados são válidos
        if (!data) {
          throw new Error('Dados do profissional não encontrados');
        }

        setProfessional(data);
      } catch (err) {
        console.error('Erro ao carregar profissional:', err);
        setError(err.message || 'Profissional não encontrado');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProfessional();
    }
  }, [id]);

  // Função auxiliar para verificar se um valor existe e não é nulo/undefined
  const safeGet = (obj, path, defaultValue = '') => {
    try {
      return path.split('.').reduce((o, p) => o && o[p], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatProjectDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getCategoryIcon = (category) => {
    if (!category) return '🔧';
    
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
    const whatsapp = safeGet(professional, 'whatsapp');
    const name = safeGet(professional, 'name');
    
    if (!whatsapp) {
      alert('WhatsApp não informado para este profissional');
      return;
    }

    const message = `Olá ${name}! Vi seu perfil no Marketplace da Construção Civil e gostaria de solicitar um orçamento.`;
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanWhatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const openProjectModal = (project) => {
    if (!project) return;
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % selectedProject.images.length
      );
    }
  };

  const prevImage = () => {
    if (selectedProject?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      );
    }
  };

  // Loading state
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

  // Error state
  if (error || !professional) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2 className="error-title">Erro ao carregar perfil</h2>
          <p className="error-message">{error || 'Profissional não encontrado'}</p>
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
                    src={safeGet(professional, 'photo') || '/placeholder-user.jpg'}
                    alt={safeGet(professional, 'name')}
                    className="profile-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-user.jpg';
                    }}
                  />
                </div>
                
                <div className="profile-info">
                  <h1 className="profile-name">
                    {safeGet(professional, 'name') || 'Nome não informado'}
                  </h1>
                  
                  <div className="profile-category">
                    <span className="category-icon">
                      {getCategoryIcon(safeGet(professional, 'category.name'))}
                    </span>
                    <span className="category-name">
                      {safeGet(professional, 'category.name') || 'Categoria não informada'}
                    </span>
                  </div>

                  {/* Subcategorias */}
                  {professional.subcategories && professional.subcategories.length > 0 && (
                    <div className="subcategories">
                      {professional.subcategories.map((sub, index) => (
                        <span key={index} className="subcategory-tag">
                          {sub.name || sub}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Localização */}
                  <div className="location-info">
                    <MapPin size={16} />
                    <span>
                      {safeGet(professional, 'cityRelation.name') || safeGet(professional, 'city') || 'Cidade não informada'}, {' '}
                      {safeGet(professional, 'cityRelation.state') || safeGet(professional, 'state') || 'Estado não informado'}
                    </span>
                  </div>

                  {/* Data de cadastro */}
                  <div className="registration-date">
                    <Calendar size={16} />
                    <span>
                      Cadastrado em {formatDate(safeGet(professional, 'created_at'))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              {safeGet(professional, 'description') && (
                <div className="profile-section">
                  <h3 className="section-title">
                    <User size={20} />
                    Sobre o Profissional
                  </h3>
                  <p className="profile-description">
                    {professional.description}
                  </p>
                </div>
              )}

              {/* Formação */}
              {safeGet(professional, 'education') && (
                <div className="profile-section">
                  <h3 className="section-title">
                    <GraduationCap size={20} />
                    Formação
                  </h3>
                  <p className="education-text">
                    {professional.education}
                  </p>
                </div>
              )}

              {/* Experiência */}
              {safeGet(professional, 'experience') && (
                <div className="profile-section">
                  <h3 className="section-title">
                    <Briefcase size={20} />
                    Experiência
                  </h3>
                  <p className="experience-text">
                    {professional.experience}
                  </p>
                </div>
              )}

              {/* Tags/Especialidades */}
              {professional.tags && professional.tags.length > 0 && (
                <div className="profile-section">
                  <h3 className="section-title">
                    <Tag size={20} />
                    Especialidades
                  </h3>
                  <div className="tags-container">
                    {professional.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {typeof tag === 'string' ? tag : tag.name || 'Tag'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Projetos */}
            {professional.projects && professional.projects.length > 0 && (
              <div className="projects-section">
                <h3 className="section-title">
                  <Briefcase size={20} />
                  Projetos Realizados
                </h3>
                <div className="projects-grid">
                  {professional.projects.map((project, index) => (
                    <div 
                      key={index} 
                      className="project-card"
                      onClick={() => openProjectModal(project)}
                    >
                      {project.images && project.images[0] && (
                        <div className="project-image">
                          <img
                            src={project.images[0]}
                            alt={project.title || 'Projeto'}
                            onError={(e) => {
                              e.target.src = '/placeholder-project.jpg';
                            }}
                          />
                        </div>
                      )}
                      <div className="project-info">
                        <h4 className="project-title">
                          {project.title || 'Projeto sem título'}
                        </h4>
                        {project.description && (
                          <p className="project-description">
                            {project.description}
                          </p>
                        )}
                        <div className="project-meta">
                          {project.date && (
                            <span className="project-date">
                              <Calendar size={14} />
                              {formatProjectDate(project.date)}
                            </span>
                          )}
                          {project.location && (
                            <span className="project-location">
                              <MapPin size={14} />
                              {project.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Card de contato */}
            <div className="contact-card">
              <h3 className="contact-title">Solicitar Orçamento</h3>
              
              {safeGet(professional, 'whatsapp') ? (
                <button
                  onClick={handleWhatsAppClick}
                  className="whatsapp-button"
                >
                  <Phone size={18} />
                  WhatsApp: {professional.whatsapp}
                </button>
              ) : (
                <p className="no-contact">WhatsApp não informado</p>
              )}

              {/* Redes sociais */}
              <div className="social-links">
                {safeGet(professional, 'instagram') && (
                  <a
                    href={professional.instagram.startsWith('http') 
                      ? professional.instagram 
                      : `https://instagram.com/${professional.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link instagram"
                  >
                    <Instagram size={16} />
                    Instagram
                  </a>
                )}

                {safeGet(professional, 'youtube') && (
                  <a
                    href={professional.youtube.startsWith('http') 
                      ? professional.youtube 
                      : `https://youtube.com/${professional.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link youtube"
                  >
                    <Youtube size={16} />
                    YouTube
                  </a>
                )}

                {safeGet(professional, 'linkedin') && (
                  <a
                    href={professional.linkedin.startsWith('http') 
                      ? professional.linkedin 
                      : `https://linkedin.com/in/${professional.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link linkedin"
                  >
                    <Linkedin size={16} />
                    LinkedIn
                  </a>
                )}

                {safeGet(professional, 'website') && (
                  <a
                    href={professional.website.startsWith('http') 
                      ? professional.website 
                      : `https://${professional.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link website"
                  >
                    <Globe size={16} />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de projeto */}
      {selectedProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={24} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">
                {selectedProject.title || 'Projeto'}
              </h2>
            </div>

            {selectedProject.images && selectedProject.images.length > 0 && (
              <div className="modal-gallery">
                <div className="gallery-main">
                  <img
                    src={selectedProject.images[currentImageIndex]}
                    alt={`${selectedProject.title || 'Projeto'} - Imagem ${currentImageIndex + 1}`}
                    className="gallery-image"
                  />
                  
                  {selectedProject.images.length > 1 && (
                    <>
                      <button className="gallery-nav prev" onClick={prevImage}>
                        <ChevronLeft size={24} />
                      </button>
                      <button className="gallery-nav next" onClick={nextImage}>
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>

                {selectedProject.images.length > 1 && (
                  <div className="gallery-thumbs">
                    {selectedProject.images.map((img, index) => (
                      <button
                        key={index}
                        className={`thumb ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img src={img} alt={`Thumb ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="modal-body">
              {selectedProject.description && (
                <p className="project-modal-description">
                  {selectedProject.description}
                </p>
              )}

              <div className="project-modal-meta">
                {selectedProject.date && (
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{formatProjectDate(selectedProject.date)}</span>
                  </div>
                )}
                {selectedProject.location && (
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>{selectedProject.location}</span>
                  </div>
                )}
                {selectedProject.duration && (
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{selectedProject.duration}</span>
                  </div>
                )}
                {selectedProject.area && (
                  <div className="meta-item">
                    <Ruler size={16} />
                    <span>{selectedProject.area}</span>
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