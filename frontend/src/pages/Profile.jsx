// frontend/src/components/Profile.jsx - VERSÃO FINAL COM /ME
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // 📸 ESTADOS PARA PORTFOLIO
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [selectedPortfolioFiles, setSelectedPortfolioFiles] = useState([]);
  const [portfolioPreview, setPortfolioPreview] = useState([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [professionalId, setProfessionalId] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // ✅ MUDANÇA: usar /me ao invés de /professionals/:id
      const response = await api.get('/professionals/me');
      const professional = response.data.data;
      
      setProfessionalId(professional.id);
      
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
        business_address: professional.businessAddress || '',
        google_maps_link: professional.googleMapsLink || '',
        category_id: professional.categoryId || '',
        subcategories: professional.subcategories || []
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

  // 📸 CARREGAR PORTFOLIO DO BACKEND
  const loadPortfolio = async (profId) => {
    try {
      const response = await api.get(`/professionals/${profId}/portfolio`);
      const portfolio = response.data.data;
      
      if (portfolio && portfolio.length > 0) {
        const images = portfolio[0].images || [];
        setPortfolioImages(images);
        console.log('📸 Portfolio carregado:', images.length, 'imagens');
      }
    } catch (err) {
      console.error('Erro ao carregar portfolio:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      const formData = new FormData();
      formData.append('profilePhoto', profilePhoto);

      const response = await api.post('/upload/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess('Foto de perfil atualizada com sucesso!');
        setProfilePhoto(null);
        updateUser({ ...user, profile_photo: response.data.data.imageUrl });
      }
    } catch (err) {
      setError('Erro ao fazer upload da foto');
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // 📸 HANDLE SELEÇÃO DE IMAGENS DO PORTFOLIO
  const handlePortfolioChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    if (portfolioImages.length + files.length > 10) {
      setError('Você pode ter no máximo 10 imagens no portfolio');
      return;
    }

    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError('Cada imagem deve ter no máximo 5MB');
      return;
    }

    setSelectedPortfolioFiles(files);

    const previews = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(results => {
      setPortfolioPreview(results);
    });
  };

  // 📤 UPLOAD DE IMAGENS DO PORTFOLIO
  const handlePortfolioUpload = async () => {
    if (selectedPortfolioFiles.length === 0) {
      setError('Selecione pelo menos uma imagem');
      return;
    }

    if (!professionalId) {
      setError('ID do profissional não encontrado');
      return;
    }

    try {
      setUploadingPortfolio(true);
      setError('');
      
      const formData = new FormData();
      selectedPortfolioFiles.forEach(file => {
        formData.append('images', file);
      });

      console.log('📤 Enviando', selectedPortfolioFiles.length, 'imagens para o portfolio');

      const response = await api.post(
        `/professionals/${professionalId}/portfolio/upload`, 
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        setSuccess(`${response.data.data.uploadedCount} imagem(ns) adicionada(s) ao portfolio!`);
        
        setSelectedPortfolioFiles([]);
        setPortfolioPreview([]);
        
        await loadPortfolio(professionalId);
      }
    } catch (err) {
      console.error('Erro ao fazer upload do portfolio:', err);
      setError(err.response?.data?.error || 'Erro ao fazer upload das imagens');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  // 🗑️ DELETAR IMAGEM DO PORTFOLIO
  const handleDeletePortfolioImage = async (index) => {
    if (!window.confirm('Tem certeza que deseja remover esta imagem?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.delete(
        `/professionals/${professionalId}/portfolio/image/${index}`
      );

      if (response.data.success) {
        setSuccess('Imagem removida com sucesso!');
        await loadPortfolio(professionalId);
      }
    } catch (err) {
      console.error('Erro ao deletar imagem:', err);
      setError(err.response?.data?.error || 'Erro ao remover imagem');
    } finally {
      setLoading(false);
    }
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
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !professionalId) {
    return <div className="profile-loading">Carregando...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Meu Perfil</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* SEÇÃO DE FOTO DE PERFIL */}
      <div className="profile-section">
        <h2>Foto de Perfil</h2>
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
            />
            <label htmlFor="profile-photo-input" className="btn btn-secondary">
              Escolher Foto
            </label>
            {profilePhoto && (
              <button
                type="button"
                onClick={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="btn btn-primary"
              >
                {uploadingPhoto ? 'Enviando...' : 'Salvar Foto'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO DE PORTFOLIO */}
      <div className="profile-section">
        <h2>Meu Portfolio</h2>
        <p className="section-description">
          Adicione imagens dos seus trabalhos (máximo 10 imagens, 5MB cada)
        </p>

        {portfolioImages.length > 0 && (
          <div className="portfolio-grid">
            {portfolioImages.map((image, index) => (
              <div key={index} className="portfolio-item">
                <img src={image.url} alt={`Portfolio ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => handleDeletePortfolioImage(index)}
                  className="btn-delete-portfolio"
                  title="Remover imagem"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="portfolio-upload-section">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePortfolioChange}
            id="portfolio-input"
            disabled={portfolioImages.length >= 10}
          />
          <label 
            htmlFor="portfolio-input" 
            className={`btn btn-secondary ${portfolioImages.length >= 10 ? 'disabled' : ''}`}
          >
            {portfolioImages.length >= 10 
              ? 'Limite de 10 imagens atingido' 
              : 'Escolher Imagens'}
          </label>

          {portfolioPreview.length > 0 && (
            <div className="portfolio-preview-grid">
              <h3>Novas imagens selecionadas:</h3>
              <div className="portfolio-grid">
                {portfolioPreview.map((preview, index) => (
                  <div key={index} className="portfolio-item preview">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handlePortfolioUpload}
                disabled={uploadingPortfolio}
                className="btn btn-primary"
              >
                {uploadingPortfolio 
                  ? 'Enviando...' 
                  : `Adicionar ${selectedPortfolioFiles.length} imagem(ns)`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FORMULÁRIO DE DADOS DO PERFIL */}
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-section">
          <h2>Informações Pessoais</h2>
          
          <div className="form-group">
            <label htmlFor="name">Nome *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
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
            />
          </div>
        </div>

        <div className="profile-section">
          <h2>Informações Profissionais</h2>
          
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
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
            />
          </div>
        </div>

        <div className="profile-section">
          <h2>Localização</h2>
          
          <div className="form-group">
            <label htmlFor="city">Cidade</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="business_address">Endereço Comercial</label>
            <input
              type="text"
              id="business_address"
              name="business_address"
              value={formData.business_address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="google_maps_link">Link Google Maps</label>
            <input
              type="url"
              id="google_maps_link"
              name="google_maps_link"
              value={formData.google_maps_link}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;