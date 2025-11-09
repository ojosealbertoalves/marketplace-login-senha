// frontend/src/pages/Profile.jsx - VERSÃO COMPLETA COM EDIÇÃO DE IMAGENS
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
    description: '',
    experience: '',
    education: '',
    whatsapp: '',
    business_address: '',
    google_maps_link: '',
    category_id: '',
    subcategories: []
  });

  // Estados de foto de perfil
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Estados de categorias
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Estados de portfolio
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

  const [professionalId, setProfessionalId] = useState(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      loadUserData();
      loadCategories();
    }
  }, [user]);

  // Carregar subcategorias quando categoria mudar
  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id);
    }
  }, [formData.category_id]);

  // ========================================
  // FUNÇÕES DE CARREGAMENTO
  // ========================================

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/professionals/me');
      const professional = response.data.data;
      
      setProfessionalId(professional.id);
      
      // Normalizar subcategorias - converter objetos para IDs
      let subcategoriesIds = [];
      if (professional.subcategories && Array.isArray(professional.subcategories)) {
        subcategoriesIds = professional.subcategories.map(sub => 
          typeof sub === 'object' ? sub.id : sub
        );
      }
      
      setFormData({
        name: professional.name || '',
        email: professional.email || '',
        phone: professional.phone || '',
        city: professional.city || '',
        state: professional.state || '',
        description: professional.description || '',
        experience: professional.experience || '',
        education: professional.education || '',
        whatsapp: professional.whatsapp || '',
        business_address: professional.business_address || '',
        google_maps_link: professional.google_maps_link || '',
        category_id: professional.category_id || '',
        subcategories: subcategoriesIds
      });

      if (professional.profile_photo) {
        setPhotoPreview(professional.profile_photo);
      }

      await loadPortfolio(professional.id);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar seus dados');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/categories');
      
      const categoriesData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      
      console.log('Categorias carregadas:', categoriesData.length);
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
      setSubcategories(response.data.data || []);
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

  const handleSubcategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      subcategories: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await api.put(`/professionals/${professionalId}`, formData);

      if (response.data.success) {
        setSuccess('Perfil atualizado com sucesso!');
        await loadUserData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil');
      console.error(err);
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
  // HANDLERS DE PORTFOLIO
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
      // ✅ Carregar imagens existentes ao editar
      setPortfolioImagePreviews(item.images || []);
      setPortfolioImages([]); // Limpar arquivos novos
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

    // ✅ Contar imagens existentes + novas
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
    // Remove da lista de previews
    setPortfolioImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // ✅ Se estiver editando, precisamos saber se é uma imagem existente ou nova
    if (editingPortfolio) {
      // Verificar se o índice é de uma imagem existente (URL) ou nova (base64)
      const imageToRemove = portfolioImagePreviews[index];
      
      // Se for base64 (nova imagem), remover do array de arquivos
      if (imageToRemove && imageToRemove.startsWith('data:')) {
        // É uma imagem nova - remover do array de files
        const newImageIndex = portfolioImagePreviews
          .slice(0, index)
          .filter(img => img.startsWith('data:')).length;
        
        setPortfolioImages(prev => prev.filter((_, i) => i !== newImageIndex));
      }
    } else {
      // Se estiver criando, apenas remover do array de arquivos
      setPortfolioImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUploadingPortfolio(true);
      setError('');

      if (editingPortfolio) {
        // ===== MODO EDIÇÃO =====
        
        let finalImages = [...portfolioImagePreviews];
        
        // Se houver novas imagens para fazer upload
        if (portfolioImages.length > 0) {
          const formDataUpload = new FormData();
          portfolioImages.forEach(file => {
            formDataUpload.append('photos', file);
          });

          try {
            console.log('📤 Enviando', portfolioImages.length, 'novas imagens...');
            
            const uploadResponse = await api.post(
              '/upload/portfolio-photos',
              formDataUpload,
              {
                headers: { 'Content-Type': 'multipart/form-data' }
              }
            );

            if (uploadResponse.data.success && uploadResponse.data.photoUrls) {
              // Substituir base64 pelas URLs reais
              const newUrls = uploadResponse.data.photoUrls;
              finalImages = finalImages.map(img => 
                img.startsWith('data:') ? newUrls.shift() || img : img
              );
              
              // Adicionar URLs restantes
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

        // Atualizar projeto com imagens finais
        const projectData = {
          ...portfolioForm,
          images: finalImages.filter(img => !img.startsWith('data:')) // Remover base64 restantes
        };

        console.log('💾 Atualizando projeto:', projectData);

        const response = await api.put(
          `/professionals/${professionalId}/portfolio/${editingPortfolio.id}`,
          projectData
        );

        if (response.data.success) {
          setSuccess('Projeto atualizado com sucesso!');
          await loadPortfolio(professionalId);
          closePortfolioModal();
        }
        
      } else {
        // ===== MODO CRIAÇÃO =====
        
        let imageUrls = [];
        
        // Fazer upload das imagens se houver
        if (portfolioImages.length > 0) {
          const formDataUpload = new FormData();
          portfolioImages.forEach(file => {
            formDataUpload.append('photos', file);
          });

          try {
            console.log('📤 Enviando', portfolioImages.length, 'imagens...');
            
            const uploadResponse = await api.post(
              '/upload/portfolio-photos',
              formDataUpload,
              {
                headers: { 'Content-Type': 'multipart/form-data' }
              }
            );

            console.log('✅ Upload concluído:', uploadResponse.data);

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

        // Criar o projeto com as URLs das imagens
        const projectData = {
          ...portfolioForm,
          images: imageUrls
        };

        console.log('💾 Salvando projeto:', projectData);

        const response = await api.post(
          `/professionals/${professionalId}/portfolio`,
          projectData
        );

        if (response.data.success) {
          setSuccess('Projeto adicionado com sucesso!');
          await loadPortfolio(professionalId);
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
        `/professionals/${professionalId}/portfolio/${itemId}`
      );

      if (response.data.success) {
        setSuccess('Projeto removido com sucesso!');
        await loadPortfolio(professionalId);
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

  if (loading && !professionalId) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

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
          PORTFOLIO
          ======================================== */}
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

      {/* ========================================
          FORMULÁRIO PRINCIPAL
          ======================================== */}
      <form onSubmit={handleSubmit} className="profile-form">
        
        {/* INFORMAÇÕES PESSOAIS */}
        <div className="profile-section">
          <h2>👤 Informações Pessoais</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nome Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Seu nome completo"
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

          <div className="form-row">
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
          </div>
        </div>

        {/* CATEGORIA E ESPECIALIDADES */}
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
              <label htmlFor="subcategories">Subcategorias / Especialidades</label>
              <select
                id="subcategories"
                name="subcategories"
                multiple
                value={formData.subcategories.map(sub => typeof sub === 'object' ? sub.id : sub)}
                onChange={handleSubcategoryChange}
                size="5"
                disabled={loadingCategories}
              >
                {subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <p className="help-text">
                Segure Ctrl (Windows) ou Cmd (Mac) para selecionar múltiplas opções
              </p>
            </div>
          )}
        </div>

        {/* INFORMAÇÕES PROFISSIONAIS */}
        <div className="profile-section">
          <h2>💼 Informações Profissionais</h2>
          
          <div className="form-group">
            <label htmlFor="description">Sobre Você</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Conte um pouco sobre você e seu trabalho..."
            />
          </div>

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
        </div>

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

          <div className="form-group">
            <label htmlFor="business_address">Endereço Comercial</label>
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
        </div>

        {/* BOTÃO DE SALVAR */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary btn-large">
            {loading ? '⏳ Salvando...' : '💾 Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* ========================================
          MODAL DE PORTFOLIO
          ======================================== */}
      {showPortfolioModal && (
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

              {/* ✅ IMAGENS - MOSTRAR TANTO NA CRIAÇÃO QUANTO NA EDIÇÃO */}
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