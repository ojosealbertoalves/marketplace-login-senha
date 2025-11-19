// frontend/src/pages/Profile.jsx - VERSÃO MULTI-TIPO DE USUÁRIO
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados do formulário principal
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    user_type: 'professional', // Tipo de usuário
    
    // Campos Profissional
    cpf: '',
    category_id: '',
    subcategories: [],
    description: '',
    experience: '',
    education: '',
    whatsapp: '',
    business_address: '',
    google_maps_link: '',
    
    // Campos Empresa
    company_name: '',
    cnpj: '',
    website: '',
    
    // Campos Cliente
    documento: '',
    
    // Redes sociais
    social_media: {
      instagram: '',
      linkedin: '',
      youtube: '',
      website: ''
    }
  });

  // Estados de foto de perfil
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Estados de categorias
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Estados de portfolio (apenas para profissionais)
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    project_type: '',
    area: '',
    duration: '',
    completed_at: '',
    tags: []
  });
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [portfolioImagePreviews, setPortfolioImagePreviews] = useState([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  const [userId, setUserId] = useState(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      loadUserData();
      loadCategories();
    }
  }, [user]);

  // Carregar subcategorias quando categoria mudar
  useEffect(() => {
    if (formData.category_id && formData.user_type === 'professional') {
      loadSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id, formData.user_type]);

  // ========================================
  // FUNÇÕES DE CARREGAMENTO
  // ========================================

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // ✅ USA A ROTA /auth/profile QUE FUNCIONA PARA TODOS
      const response = await api.get('/auth/profile');
      
      if (!response.data.success) {
        throw new Error('Erro ao carregar dados');
      }
      
      const userData = response.data.data;
      console.log('✅ Dados do usuário carregados:', userData);
      
      setUserId(userData.id);
      
      // Normalizar subcategorias
      let subcategoriesIds = [];
      if (userData.subcategories && Array.isArray(userData.subcategories)) {
        subcategoriesIds = userData.subcategories.map(sub => 
          typeof sub === 'object' ? sub.id : sub
        );
      }

      // Normalizar redes sociais
      let socialMedia = {
        instagram: '',
        linkedin: '',
        youtube: '',
        website: ''
      };

      if (userData.social_media) {
        if (typeof userData.social_media === 'string') {
          try {
            socialMedia = { ...socialMedia, ...JSON.parse(userData.social_media) };
          } catch (e) {
            console.error('Erro ao parsear social_media:', e);
          }
        } else if (typeof userData.social_media === 'object') {
          socialMedia = { ...socialMedia, ...userData.social_media };
        }
      }
      
      // ✅ CARREGA TODOS OS CAMPOS INDEPENDENTE DO TIPO
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        city: userData.city || '',
        state: userData.state || '',
        user_type: userData.user_type || 'client',
        
        // Profissional
        cpf: userData.cpf || '',
        category_id: userData.category_id || '',
        subcategories: subcategoriesIds,
        description: userData.description || '',
        experience: userData.experience || '',
        education: userData.education || '',
        whatsapp: userData.whatsapp || '',
        business_address: userData.business_address || '',
        google_maps_link: userData.google_maps_link || '',
        
        // Empresa
        company_name: userData.company_name || '',
        cnpj: userData.cnpj || '',
        website: userData.website || '',
        
        // Cliente / Geral
        documento: userData.documento || userData.cpf || userData.cnpj || '',
        
        // Redes sociais
        social_media: socialMedia
      });

      if (userData.profile_photo) {
        setPhotoPreview(userData.profile_photo);
      }

      // Carregar portfolio apenas se for profissional
      if (userData.user_type === 'professional' && userData.id) {
        await loadPortfolio(userData.id);
      }

    } catch (err) {
      console.error('❌ Erro ao carregar dados do usuário:', err);
      setError(err.response?.data?.error || 'Erro ao carregar seus dados');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/categories');
      
      const categoriesData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      
      setCategories(categoriesData);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      setLoadingCategories(true);
      const response = await api.get(`/categories/${categoryId}/subcategories`);
      
      const subcategoriesData = response.data.data || response.data || [];
      
      setSubcategories(subcategoriesData);
    } catch (err) {
      console.error('Erro ao carregar subcategorias:', err);
      setSubcategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadPortfolio = async (profId) => {
    try {
      const response = await api.get(`/professionals/${profId}/portfolio`);
      setPortfolioItems(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar portfolio:', err);
      setPortfolioItems([]);
    }
  };

  // ========================================
  // HANDLERS DO FORMULÁRIO PRINCIPAL
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (newType) => {
    if (window.confirm(`Tem certeza que deseja mudar para ${newType === 'professional' ? 'Profissional' : newType === 'company' ? 'Empresa' : 'Cliente Final'}?`)) {
      setFormData(prev => ({
        ...prev,
        user_type: newType
      }));
    }
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [name]: value
      }
    }));
  };

  const handleSubcategoryToggle = (subcategoryId) => {
    setFormData(prev => {
      const currentSubcategories = prev.subcategories || [];
      const isSelected = currentSubcategories.includes(subcategoryId);
      
      return {
        ...prev,
        subcategories: isSelected
          ? currentSubcategories.filter(id => id !== subcategoryId)
          : [...currentSubcategories, subcategoryId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // ✅ USA A ROTA /auth/profile QUE FUNCIONA PARA TODOS
      const response = await api.put('/auth/profile', formData);

      if (response.data.success) {
        setSuccess('Perfil atualizado com sucesso!');
        await refreshUser();
        await loadUserData();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao atualizar perfil');
      console.error('❌ Erro ao atualizar:', err);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HANDLERS DE FOTO DE PERFIL
  // ========================================

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('A foto deve ter no máximo 5MB');
        return;
      }
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!profilePhoto) return;

    try {
      setUploadingPhoto(true);
      setError('');
      
      const formDataUpload = new FormData();
      formDataUpload.append('photo', profilePhoto);

      const response = await api.post('/upload/profile-photo', formDataUpload, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success || response.data.photoUrl || response.data.data?.imageUrl) {
        const photoUrl = response.data.photoUrl || response.data.data?.imageUrl;
        
        setSuccess('Foto de perfil atualizada com sucesso!');
        setProfilePhoto(null);
        setPhotoPreview(photoUrl);
        
        await refreshUser();
        await loadUserData();
      }
    } catch (err) {
      console.error('Erro completo:', err);
      
      if (err.response?.status === 401) {
        setError('Sessão expirada. Por favor, faça login novamente.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao fazer upload da foto');
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('Tem certeza que deseja remover sua foto de perfil?')) {
      return;
    }

    try {
      setUploadingPhoto(true);
      setError('');
      
      const response = await api.delete('/upload/profile-photo');

      if (response.data.success) {
        setSuccess('Foto de perfil removida com sucesso!');
        setPhotoPreview('');
        setProfilePhoto(null);
        
        await refreshUser();
        await loadUserData();
      }
    } catch (err) {
      console.error('Erro ao deletar foto:', err);
      
      if (err.response?.status === 401) {
        setError('Sessão expirada. Por favor, faça login novamente.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao remover foto');
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ========================================
  // HANDLERS DE PORTFOLIO (mantidos iguais, mas apenas para profissionais)
  // ========================================

  const openPortfolioModal = (item = null) => {
    if (item) {
      setEditingPortfolio(item);
      setPortfolioForm({
        title: item.title || '',
        description: item.description || '',
        project_type: item.project_type || '',
        area: item.area || '',
        duration: item.duration || '',
        completed_at: item.completed_at ? item.completed_at.split('T')[0] : '',
        tags: item.tags || []
      });
      setPortfolioImagePreviews(item.images || []);
      setPortfolioImages([]);
    } else {
      setEditingPortfolio(null);
      setPortfolioForm({
        title: '',
        description: '',
        project_type: '',
        area: '',
        duration: '',
        completed_at: '',
        tags: []
      });
      setPortfolioImages([]);
      setPortfolioImagePreviews([]);
    }
    setShowPortfolioModal(true);
  };

  const closePortfolioModal = () => {
    setShowPortfolioModal(false);
    setEditingPortfolio(null);
    setPortfolioForm({
      title: '',
      description: '',
      project_type: '',
      area: '',
      duration: '',
      completed_at: '',
      tags: []
    });
    setPortfolioImages([]);
    setPortfolioImagePreviews([]);
  };

  const handlePortfolioFormChange = (e) => {
    const { name, value } = e.target;
    setPortfolioForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePortfolioTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setPortfolioForm(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };

  const handlePortfolioImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const totalImages = portfolioImagePreviews.length + files.length;
    if (totalImages > 5) {
      setError(`Você pode ter no máximo 5 imagens. Você já tem ${portfolioImagePreviews.length} imagem(ns).`);
      return;
    }

    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError('Cada imagem deve ter no máximo 5MB');
      return;
    }

    setPortfolioImages(prev => [...prev, ...files]);

    const previews = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(results => {
      setPortfolioImagePreviews(prev => [...prev, ...results]);
    });
  };

  const removePortfolioImagePreview = (index) => {
    setPortfolioImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    if (editingPortfolio) {
      const imageToRemove = portfolioImagePreviews[index];
      
      if (imageToRemove && imageToRemove.startsWith('data:')) {
        const newImageIndex = portfolioImagePreviews
          .slice(0, index)
          .filter(img => img.startsWith('data:')).length;
        
        setPortfolioImages(prev => prev.filter((_, i) => i !== newImageIndex));
      }
    } else {
      setPortfolioImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUploadingPortfolio(true);
      setError('');

      if (editingPortfolio) {
        let finalImages = [...portfolioImagePreviews];
        
        if (portfolioImages.length > 0) {
          const formDataUpload = new FormData();
          portfolioImages.forEach(file => {
            formDataUpload.append('photos', file);
          });

          try {
            const uploadResponse = await api.post(
              '/upload/portfolio-photos',
              formDataUpload,
              {
                headers: { 'Content-Type': 'multipart/form-data' }
              }
            );

            if (uploadResponse.data.success && uploadResponse.data.photoUrls) {
              const newUrls = uploadResponse.data.photoUrls;
              finalImages = finalImages.map(img => 
                img.startsWith('data:') ? newUrls.shift() || img : img
              );
              
              if (newUrls.length > 0) {
                finalImages.push(...newUrls);
              }
            }
          } catch (uploadError) {
            console.error('❌ Erro no upload:', uploadError);
            setError(uploadError.response?.data?.error || 'Erro ao fazer upload das imagens');
            setUploadingPortfolio(false);
            return;
          }
        }

        const projectData = {
          ...portfolioForm,
          images: finalImages.filter(img => !img.startsWith('data:'))
        };

        const response = await api.put(
          `/professionals/${userId}/portfolio/${editingPortfolio.id}`,
          projectData
        );

        if (response.data.success) {
          setSuccess('Projeto atualizado com sucesso!');
          await loadPortfolio(userId);
          closePortfolioModal();
        }
        
      } else {
        let imageUrls = [];
        
        if (portfolioImages.length > 0) {
          const formDataUpload = new FormData();
          portfolioImages.forEach(file => {
            formDataUpload.append('photos', file);
          });

          try {
            const uploadResponse = await api.post(
              '/upload/portfolio-photos',
              formDataUpload,
              {
                headers: { 'Content-Type': 'multipart/form-data' }
              }
            );

            if (uploadResponse.data.success && uploadResponse.data.photoUrls) {
              imageUrls = uploadResponse.data.photoUrls;
            }
          } catch (uploadError) {
            console.error('❌ Erro no upload:', uploadError);
            setError(uploadError.response?.data?.error || 'Erro ao fazer upload das imagens');
            setUploadingPortfolio(false);
            return;
          }
        }

        const projectData = {
          ...portfolioForm,
          images: imageUrls
        };

        const response = await api.post(
          `/professionals/${userId}/portfolio`,
          projectData
        );

        if (response.data.success) {
          setSuccess('Projeto adicionado com sucesso!');
          await loadPortfolio(userId);
          closePortfolioModal();
        }
      }
    } catch (err) {
      console.error('❌ Erro ao salvar projeto:', err);
      setError(err.response?.data?.error || 'Erro ao salvar projeto');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleDeletePortfolioItem = async (itemId) => {
    if (!window.confirm('Tem certeza que deseja remover este projeto do portfolio?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.delete(
        `/professionals/${userId}/portfolio/${itemId}`
      );

      if (response.data.success) {
        setSuccess('Projeto removido com sucesso!');
        await loadPortfolio(userId);
      }
    } catch (err) {
      console.error('❌ Erro ao deletar projeto:', err);
      setError(err.response?.data?.error || 'Erro ao remover projeto');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  if (loading && !userId) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  const isProfessional = formData.user_type === 'professional';
  const isCompany = formData.user_type === 'company';
  const isClient = formData.user_type === 'client';

  return (
    <div className="profile-container">
      <h1>Meu Perfil</h1>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      {/* ========================================
          SELETOR DE TIPO DE USUÁRIO
          ======================================== */}
      <div className="profile-section user-type-section">
        <h2>👤 Tipo de Conta</h2>
        <p className="section-description">
          Escolha como você quer aparecer na plataforma
        </p>
        
        <div className="user-type-selector">
          <button
            type="button"
            className={`type-button ${isProfessional ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('professional')}
          >
            <span className="type-icon">👷</span>
            <div>
              <strong>Profissional</strong>
              <small>Apareço nas buscas como prestador de serviços</small>
            </div>
          </button>
          
          <button
            type="button"
            className={`type-button ${isCompany ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('company')}
          >
            <span className="type-icon">🏢</span>
            <div>
              <strong>Empresa</strong>
              <small>Apareço nas buscas representando minha empresa</small>
            </div>
          </button>
          
          <button
            type="button"
            className={`type-button ${isClient ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('client')}
          >
            <span className="type-icon">👤</span>
            <div>
              <strong>Cliente Final</strong>
              <small>Não apareço nas buscas, apenas busco profissionais</small>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================
          FOTO DE PERFIL
          ======================================== */}
      <div className="profile-section">
        <h2>📸 Foto de Perfil</h2>
        <div className="profile-photo-section">
          {photoPreview && (
            <div className="photo-preview">
              <img src={photoPreview} alt="Preview" />
            </div>
          )}
          <div className="photo-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              id="profile-photo-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="profile-photo-input" className="btn btn-secondary">
              📁 Escolher Foto
            </label>
            {profilePhoto && (
              <button
                type="button"
                onClick={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="btn btn-primary"
              >
                {uploadingPhoto ? '⏳ Enviando...' : '✅ Salvar Foto'}
              </button>
            )}
            {photoPreview && (
              <button
                type="button"
                onClick={handleDeletePhoto}
                disabled={uploadingPhoto}
                className="btn btn-danger"
              >
                🗑️ Remover Foto
              </button>
            )}
          </div>
          <p className="help-text">Tamanho máximo: 5MB | Formatos: JPG, PNG, GIF</p>
        </div>
      </div>

      {/* ========================================
          PORTFOLIO (APENAS PARA PROFISSIONAIS)
          ======================================== */}
      {isProfessional && (
        <div className="profile-section portfolio-section">
          <div className="portfolio-header">
            <div className="section-header">
              <h2>🎨 Meu Portfolio</h2>
            </div>
            <button
              type="button"
              onClick={() => openPortfolioModal()}
              className="btn btn-primary"
            >
              ➕ Adicionar Projeto
            </button>
          </div>
          <p className="section-description">
            Mostre seus melhores trabalhos para atrair mais clientes
          </p>

          {portfolioItems.length > 0 ? (
            <div className="portfolio-grid">
              {portfolioItems.map((item) => (
                <div key={item.id} className="portfolio-card">
                  <div className="portfolio-card-image">
                    {item.images && item.images.length > 0 ? (
                      <>
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="no-image">📷</div>';
                          }}
                        />
                        {item.images.length > 1 && (
                          <span className="image-count">+{item.images.length - 1}</span>
                        )}
                      </>
                    ) : (
                      <div className="no-image">📷</div>
                    )}
                  </div>
                  <div className="portfolio-card-content">
                    <h3>{item.title}</h3>
                    {item.project_type && (
                      <span className="project-type">{item.project_type}</span>
                    )}
                    {item.description && (
                      <p className="portfolio-description">{item.description}</p>
                    )}
                    <div className="portfolio-card-actions">
                      <button
                        type="button"
                        onClick={() => openPortfolioModal(item)}
                        className="btn btn-sm btn-secondary"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePortfolioItem(item.id)}
                        className="btn btn-sm btn-danger"
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>📁 Você ainda não adicionou nenhum projeto ao seu portfolio</p>
              <button
                type="button"
                onClick={() => openPortfolioModal()}
                className="btn btn-primary"
              >
                ➕ Adicionar Primeiro Projeto
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================
          FORMULÁRIO PRINCIPAL
          ======================================== */}
      <form onSubmit={handleSubmit} className="profile-form">
        
        {/* INFORMAÇÕES PESSOAIS */}
       

<div className="profile-section">
  <h2>👤 Informações {isCompany ? 'da Empresa' : 'Pessoais'}</h2>
  
  <div className="form-row">
    <div className="form-group">
      <label htmlFor="name">
        {isCompany ? 'Nome do Responsável' : 'Nome Completo'} *
      </label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder={isCompany ? "Nome do responsável" : "Seu nome completo"}
      />
    </div>

    <div className="form-group">
      <label htmlFor="email">Email *</label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="seu@email.com"
      />
    </div>
  </div>

  {isCompany && (
    <div className="form-group">
      <label htmlFor="company_name">Nome da Empresa *</label>
      <input
        type="text"
        id="company_name"
        name="company_name"
        value={formData.company_name}
        onChange={handleChange}
        placeholder="Nome fantasia ou razão social"
      />
    </div>
  )}

  <div className="form-row">
    {/* ✅ CPF/CNPJ/DOCUMENTO - SOMENTE LEITURA */}
    {isProfessional && formData.cpf && (
      <div className="form-group">
        <label htmlFor="cpf">CPF</label>
        <input
          type="text"
          id="cpf"
          name="cpf"
          value={formData.cpf}
          readOnly
          className="readonly-input"
          style={{
            backgroundColor: '#f3f4f6',
            cursor: 'not-allowed',
            color: '#6b7280'
          }}
        />
        <p className="help-text" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          ℹ️ CPF não pode ser alterado
        </p>
      </div>
    )}

    {isCompany && formData.cnpj && (
      <div className="form-group">
        <label htmlFor="cnpj">CNPJ</label>
        <input
          type="text"
          id="cnpj"
          name="cnpj"
          value={formData.cnpj}
          readOnly
          className="readonly-input"
          style={{
            backgroundColor: '#f3f4f6',
            cursor: 'not-allowed',
            color: '#6b7280'
          }}
        />
        <p className="help-text" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          ℹ️ CNPJ não pode ser alterado
        </p>
      </div>
    )}

    {isClient && formData.documento && (
      <div className="form-group">
        <label htmlFor="documento">CPF/CNPJ</label>
        <input
          type="text"
          id="documento"
          name="documento"
          value={formData.documento}
          readOnly
          className="readonly-input"
          style={{
            backgroundColor: '#f3f4f6',
            cursor: 'not-allowed',
            color: '#6b7280'
          }}
        />
        <p className="help-text" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          ℹ️ Documento não pode ser alterado
        </p>
      </div>
    )}

    <div className="form-group">
      <label htmlFor="phone">Telefone</label>
      <input
        type="tel"
        id="phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="(00) 00000-0000"
      />
    </div>
  </div>

  {isProfessional && (
    <div className="form-group">
      <label htmlFor="whatsapp">WhatsApp</label>
      <input
        type="tel"
        id="whatsapp"
        name="whatsapp"
        value={formData.whatsapp}
        onChange={handleChange}
        placeholder="(00) 00000-0000"
      />
    </div>
  )}
</div>



        {/* CATEGORIA E ESPECIALIDADES (APENAS PROFISSIONAL) */}
        {isProfessional && (
          <div className="profile-section">
            <h2>🏷️ Categoria e Especialidades</h2>
            
            <div className="form-group">
              <label htmlFor="category_id">Categoria Principal *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                disabled={loadingCategories}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.category_id && subcategories.length > 0 && (
              <div className="form-group">
                <label>Subcategorias / Especialidades</label>
                <p className="help-text" style={{ marginBottom: '12px' }}>
                  Selecione uma ou mais especialidades da sua área
                </p>
                
                {loadingCategories ? (
                  <div className="loading-subcategories">
                    <p>Carregando especialidades...</p>
                  </div>
                ) : (
                  <div className="subcategories-checkbox-list">
                    {subcategories.map(sub => (
                      <label key={sub.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          value={sub.id}
                          checked={formData.subcategories.includes(sub.id)}
                          onChange={() => handleSubcategoryToggle(sub.id)}
                        />
                        <span className="checkbox-label">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {formData.subcategories.length > 0 && (
                  <p className="help-text" style={{ marginTop: '12px', color: '#10b981' }}>
                    ✓ {formData.subcategories.length} especialidade(s) selecionada(s)
                  </p>
                )}
              </div>
            )}

            {formData.category_id && subcategories.length === 0 && !loadingCategories && (
              <div className="form-group">
                <p className="help-text" style={{ color: '#6b7280', fontStyle: 'italic', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                  ℹ️ Esta categoria ainda não possui subcategorias cadastradas.
                </p>
              </div>
            )}
          </div>
        )}

        {/* INFORMAÇÕES PROFISSIONAIS */}
        {(isProfessional || isCompany) && (
          <div className="profile-section">
            <h2>💼 Informações {isCompany ? 'da Empresa' : 'Profissionais'}</h2>
            
            <div className="form-group">
              <label htmlFor="description">
                {isCompany ? 'Sobre a Empresa' : 'Sobre Você'}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder={isCompany ? "Conte sobre sua empresa..." : "Conte um pouco sobre você e seu trabalho..."}
              />
            </div>

            {isProfessional && (
              <>
                <div className="form-group">
                  <label htmlFor="experience">Experiência</label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Descreva sua experiência profissional..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="education">Formação</label>
                  <textarea
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Cursos, certificações, formação acadêmica..."
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* REDES SOCIAIS */}
        {(isProfessional || isCompany) && (
          <div className="profile-section">
            <h2>🌐 Redes Sociais e Website</h2>
            <p className="section-description">
              Adicione seus perfis nas redes sociais para facilitar o contato com clientes
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="instagram">📷 Instagram</label>
                <input
                  type="url"
                  id="instagram"
                  name="instagram"
                  value={formData.social_media.instagram || ''}
                  onChange={handleSocialMediaChange}
                  placeholder="https://instagram.com/seu-usuario"
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkedin">💼 LinkedIn</label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.social_media.linkedin || ''}
                  onChange={handleSocialMediaChange}
                  placeholder="https://linkedin.com/in/seu-perfil"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="youtube">📹 YouTube</label>
                <input
                  type="url"
                  id="youtube"
                  name="youtube"
                  value={formData.social_media.youtube || ''}
                  onChange={handleSocialMediaChange}
                  placeholder="https://youtube.com/@seu-canal"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">🌐 Website / Portfólio</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={isCompany ? formData.website : formData.social_media.website || ''}
                  onChange={isCompany ? handleChange : handleSocialMediaChange}
                  placeholder="https://seusite.com.br"
                />
              </div>
            </div>
          </div>
        )}

        {/* LOCALIZAÇÃO */}
        <div className="profile-section">
          <h2>📍 Localização</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">Cidade</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Sua cidade"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">Estado</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="UF"
                maxLength="2"
              />
            </div>
          </div>

          {(isProfessional || isCompany) && (
            <>
              <div className="form-group">
                <label htmlFor="business_address">Endereço {isCompany ? 'da Empresa' : 'Comercial'}</label>
                <input
                  type="text"
                  id="business_address"
                  name="business_address"
                  value={formData.business_address}
                  onChange={handleChange}
                  placeholder="Rua, número, bairro..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="google_maps_link">Link do Google Maps</label>
                <input
                  type="url"
                  id="google_maps_link"
                  name="google_maps_link"
                  value={formData.google_maps_link}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                />
                <p className="help-text">
                  Cole o link do Google Maps para facilitar que clientes encontrem você
                </p>
              </div>
            </>
          )}
        </div>

        {/* BOTÃO DE SALVAR */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary btn-large">
            {loading ? '⏳ Salvando...' : '💾 Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* MODAL DE PORTFOLIO (apenas para profissionais) */}
      {isProfessional && showPortfolioModal && (
        <div className="modal-overlay" onClick={closePortfolioModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPortfolio ? '✏️ Editar Projeto' : '➕ Novo Projeto'}</h2>
              <button type="button" onClick={closePortfolioModal} className="modal-close">
                ×
              </button>
            </div>

            <form onSubmit={handlePortfolioSubmit} className="portfolio-form">
              <div className="form-group">
                <label htmlFor="portfolio-title">Título do Projeto</label>
                <input
                  type="text"
                  id="portfolio-title"
                  name="title"
                  value={portfolioForm.title}
                  onChange={handlePortfolioFormChange}
                  placeholder="Ex: Reforma residencial completa"
                />
              </div>

              <div className="form-group">
                <label htmlFor="portfolio-description">Descrição</label>
                <textarea
                  id="portfolio-description"
                  name="description"
                  value={portfolioForm.description}
                  onChange={handlePortfolioFormChange}
                  rows="4"
                  placeholder="Descreva o projeto, desafios e resultados..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="portfolio-type">Tipo de Projeto</label>
                  <input
                    type="text"
                    id="portfolio-type"
                    name="project_type"
                    value={portfolioForm.project_type}
                    onChange={handlePortfolioFormChange}
                    placeholder="Ex: Residencial, Comercial..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="portfolio-area">Área</label>
                  <input
                    type="text"
                    id="portfolio-area"
                    name="area"
                    value={portfolioForm.area}
                    onChange={handlePortfolioFormChange}
                    placeholder="Ex: 120m²"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="portfolio-duration">Duração</label>
                  <input
                    type="text"
                    id="portfolio-duration"
                    name="duration"
                    value={portfolioForm.duration}
                    onChange={handlePortfolioFormChange}
                    placeholder="Ex: 3 meses"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="portfolio-completed">Data de Conclusão</label>
                  <input
                    type="date"
                    id="portfolio-completed"
                    name="completed_at"
                    value={portfolioForm.completed_at}
                    onChange={handlePortfolioFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="portfolio-tags">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  id="portfolio-tags"
                  name="tags"
                  value={portfolioForm.tags.join(', ')}
                  onChange={handlePortfolioTagsChange}
                  placeholder="Ex: moderna, sustentável, luxo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="portfolio-images">
                  {editingPortfolio ? 'Gerenciar Imagens do Projeto (máx. 5)' : 'Imagens do Projeto (máx. 5)'}
                </label>
                
                <input
                  type="file"
                  id="portfolio-images"
                  accept="image/*"
                  multiple
                  onChange={handlePortfolioImagesChange}
                  style={{ display: 'none' }}
                />
                
                <label htmlFor="portfolio-images" className="btn btn-secondary btn-block">
                  📁 {editingPortfolio ? 'Adicionar Mais Imagens' : 'Escolher Imagens'}
                </label>
                
                {portfolioImagePreviews.length > 0 && (
                  <div className="image-previews">
                    {portfolioImagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          onClick={() => removePortfolioImagePreview(index)}
                          className="remove-preview"
                          title="Remover imagem"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="help-text">
                  {portfolioImagePreviews.length} / 5 imagens | Máx: 5MB cada
                  {editingPortfolio && ' | Clique no × para remover imagens'}
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closePortfolioModal}
                  className="btn btn-secondary"
                  disabled={uploadingPortfolio}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadingPortfolio}
                >
                  {uploadingPortfolio ? '⏳ Salvando...' : '💾 Salvar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;