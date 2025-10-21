// frontend/src/pages/ProfessionalProfile.jsx - VERSÃO ORIGINAL COMPLETA
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
  Award,
  Lock,
  UserPlus
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ProfessionalProfile.css';

const ProfessionalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
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
        console.log('Dados do profissional:', data);
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
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatProjectDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    });
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

  const handleWhatsAppClick = () => {
    if (!isAuthenticated) {
      alert('Faça login para entrar em contato com este profissional');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    const message = `Olá ${professional.name}! Vi seu perfil no Catálogo Construção e gostaria de conversar sobre seus serviços.`;
    const phoneNumber = (professional.whatsapp || professional.phone)?.replace(/\D/g, '');
    if (phoneNumber) {
      const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handlePhoneClick = () => {
    if (!isAuthenticated) {
      alert('Faça login para ver informações de contato');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    const phoneNumber = professional.whatsapp || professional.phone;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject && selectedProject.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedProject.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (selectedProject && selectedProject.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="profile-error">
        <p>{error || 'Profissional não encontrado'}</p>
        <button onClick={() => navigate('/')} className="back-home-btn">
          Voltar para Home
        </button>
      </div>
    );
  }

  // Formatar categoria para exibição
  const categoryName = typeof professional.category === 'object' 
    ? professional.category.name 
    : professional.category;

  // Formatar subcategorias para exibição
  const formattedSubcategories = professional.subcategories && professional.subcategories.length > 0
    ? professional.subcategories.map(sub => 
        typeof sub === 'object' ? sub.name : sub
      ).join(', ')
    : (typeof professional.subcategory === 'object' 
        ? professional.subcategory.name 
        : professional.subcategory || 'Não especificada');

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
                    src={professional.profile_photo || professional.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&size=200&background=0D8ABC&color=fff`}
                    alt={professional.name}
                    className="profile-image"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&size=200&background=0D8ABC&color=fff`;
                    }}
                  />
                </div>
                
                <div className="profile-info">
                  <h1 className="profile-name">{professional.name}</h1>
                  
                  <div className="profile-category">
                    <span className="category-icon">
                      {getCategoryIcon(categoryName)}
                    </span>
                    <span>{categoryName}</span>
                  </div>
                  
                  <div className="profile-location">
                    <MapPin size={16} />
                    <span>{professional.city}, {professional.state}</span>
                  </div>
                  
                  {professional.memberSince && (
                    <div className="member-since">
                      <Calendar size={16} />
                      <span>Membro desde {formatDate(professional.memberSince)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subcategorias */}
              {formattedSubcategories !== 'Não especificada' && (
                <div className="subcategories-section">
                  <div className="section-header">
                    <Tag size={18} />
                    <h3>Especialidades</h3>
                  </div>
                  <p className="subcategories-text">{formattedSubcategories}</p>
                </div>
              )}

              {/* Descrição */}
              {professional.description && (
                <div className="description-section">
                  <h3>Sobre</h3>
                  <p>{professional.description}</p>
                </div>
              )}
            </div>

            {/* Indicação */}
            {professional.indicationsReceived && professional.indicationsReceived.length > 0 && (
              <div className="indication-card">
                <div className="indication-badge">
                  <Award size={20} />
                  <span>Profissional Indicado</span>
                </div>
                <p className="indication-text">
                  Indicado por <strong>{professional.indicationsReceived[0].fromProfessional?.name || professional.referredBy || 'Outro profissional'}</strong>
                </p>
                {professional.indicationsReceived[0].date && (
                  <p className="indication-date">
                    em {formatDate(professional.indicationsReceived[0].date)}
                  </p>
                )}
              </div>
            )}

            {/* Formação e Experiência */}
            <div className="info-card">
              <div className="info-section">
                <div className="section-header">
                  <GraduationCap size={20} />
                  <h3>Formação</h3>
                </div>
                <p className="section-content">{professional.education || 'Não informada'}</p>
              </div>
              
              <div className="info-section">
                <div className="section-header">
                  <Briefcase size={20} />
                  <h3>Experiência</h3>
                </div>
                <p className="section-content">{professional.experience || 'Não informada'}</p>
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
                          src={project.images && project.images[0] ? 
                            project.images[0] : 
                            'https://via.placeholder.com/400x300?text=Sem+Imagem'
                          }
                          alt={project.title}
                          className="project-image"
                        />
                        {project.images && project.images.length > 1 && (
                          <div className="image-count-badge">
                            <Image size={14} />
                            {project.images.length}
                          </div>
                        )}
                      </div>
                      <div className="project-info">
                        <h4 className="project-title">{project.title}</h4>
                        {project.project_type && (
                          <span className="project-type">{project.project_type}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar com contato */}
          <aside className="sidebar">
            <div className="contact-card">
              <h3 className="contact-title">Informações de Contato</h3>
              
              {isAuthenticated ? (
                <>
                  {/* Botão WhatsApp */}
                  {(professional.whatsapp || professional.phone) && (
                    <button 
                      className="contact-button whatsapp"
                      onClick={handleWhatsAppClick}
                    >
                      <Phone size={20} />
                      <span>Chamar no WhatsApp</span>
                    </button>
                  )}
                  
                  {/* Botão Telefone */}
                  {(professional.whatsapp || professional.phone) && (
                    <button 
                      className="contact-button phone"
                      onClick={handlePhoneClick}
                    >
                      <Phone size={20} />
                      <span>{professional.whatsapp || professional.phone}</span>
                    </button>
                  )}

                  {/* Endereço */}
                  {professional.business_address && (
                    <div className="contact-info-item">
                      <MapPin size={18} />
                      <div>
                        <p className="contact-label">Endereço</p>
                        <p className="contact-value">{professional.business_address}</p>
                        {professional.google_maps_link && (
                          <a
                            href={professional.google_maps_link}
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
                  
                  {/* Redes Sociais */}
                  {professional.social_media && (
                    <div className="social-links">
                      {professional.social_media.instagram && (
                        <a 
                          href={professional.social_media.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                        >
                          <Instagram size={20} />
                        </a>
                      )}
                      {professional.social_media.linkedin && (
                        <a 
                          href={professional.social_media.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                        >
                          <Linkedin size={20} />
                        </a>
                      )}
                      {professional.social_media.youtube && (
                        <a 
                          href={professional.social_media.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                        >
                          <Youtube size={20} />
                        </a>
                      )}
                      {professional.social_media.website && (
                        <a 
                          href={professional.social_media.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                        >
                          <Globe size={20} />
                        </a>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="contact-locked">
                  <Lock size={40} />
                  <p>Faça login para ver as informações de contato</p>
                  <button 
                    className="login-button"
                    onClick={() => {
                      localStorage.setItem('redirectAfterLogin', window.location.pathname);
                      navigate('/login');
                    }}
                  >
                    <UserPlus size={18} />
                    Fazer Login
                  </button>
                </div>
              )}
            </div>

            {/* Card de Indicação */}
            {isAuthenticated && user?.user_type === 'professional' && (
              <div className="indicate-card">
                <div className="indicate-header">
                  <Award size={24} />
                  <h3>Indique este profissional</h3>
                </div>
                <p>Conhece o trabalho e gostaria de indicar?</p>
                <button className="indicate-button">
                  <ExternalLink size={18} />
                  Fazer Indicação
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Modal de Projeto */}
      {selectedProject && (
        <div className="project-modal-overlay" onClick={closeProjectModal}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProjectModal}>
              <X size={24} />
            </button>
            
            <div className="modal-content">
              {selectedProject.images && selectedProject.images.length > 0 && (
                <div className="modal-images">
                  <div className="main-image-container">
                    <img
                      src={selectedProject.images[currentImageIndex]}
                      alt={`${selectedProject.title} - Imagem ${currentImageIndex + 1}`}
                      className="modal-main-image"
                    />
                    
                    {selectedProject.images.length > 1 && (
                      <>
                        <button className="image-nav prev" onClick={previousImage}>
                          <ChevronLeft size={30} />
                        </button>
                        <button className="image-nav next" onClick={nextImage}>
                          <ChevronRight size={30} />
                        </button>
                        <div className="image-counter">
                          {currentImageIndex + 1} / {selectedProject.images.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {selectedProject.images.length > 1 && (
                    <>
                      <div className="image-thumbnails">
                        {selectedProject.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Miniatura ${index + 1}`}
                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
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
                
                {selectedProject.project_type && (
                  <span className="modal-type">{selectedProject.project_type}</span>
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
                  {selectedProject.completed_at && (
                    <div className="modal-detail">
                      <Calendar size={16} />
                      <span>Concluído em: {formatProjectDate(selectedProject.completed_at)}</span>
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