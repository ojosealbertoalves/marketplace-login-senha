// frontend/src/pages/Profile.jsx - VERSÃO REFATORADA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Building, Mail, Phone, MapPin, Edit2, Save, X, 
  AlertCircle, CheckCircle, Camera, Plus, Trash2, Image as ImageIcon 
} from 'lucide-react';
import './Profile.css';

// ========== CONSTANTES ==========
const API_URL = 'http://localhost:3001/api';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ========== COMPONENTE PRINCIPAL ==========
function Profile() {
  const navigate = useNavigate();
  const { user, token, logout, isClient, isProfessional, isCompany } = useAuth();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Dados do perfil
  const [fullUserData, setFullUserData] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', city: '', state: '',
    category_id: '', description: '', experience: '', education: '',
    companyName: '', website: ''
  });
  
  // Categorias e subcategorias
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  
  // Portfólio
  const [portfolio, setPortfolio] = useState([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '', description: '', project_type: '', images: []
  });

  // ========== EFEITOS ==========
  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, token, navigate]);

  useEffect(() => {
    if (profileData.category_id) {
      loadSubcategories(profileData.category_id);
    } else {
      setSubcategories([]);
      setSelectedSubcategories([]);
    }
  }, [profileData.category_id]);

  // ========== FUNÇÕES DE CARREGAMENTO ==========
  
  const loadData = async () => {
    try {
      await Promise.all([
        loadProfile(),
        loadCategories(),
        isProfessional && loadPortfolio()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showMessage('error', 'Erro ao carregar dados do perfil');
    }
  };

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erro ao carregar perfil');

      const data = await response.json();
      setFullUserData(data.user);
      
      const mapped = mapProfileData(data.user);
      setProfileData(mapped);
      
      // Carregar subcategorias selecionadas
      if (data.user.professionalProfile?.subcategories?.length > 0) {
        setSelectedSubcategories(
          data.user.professionalProfile.subcategories.map(sub => sub.id)
        );
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      showMessage('error', 'Erro ao carregar perfil');
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      const categoriesArray = Array.isArray(data) ? data : (data.data || []);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      showMessage('error', 'Erro ao carregar categorias');
    }
  };

  const loadSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/categories/${categoryId}/subcategories`);
      const data = await response.json();
      const subcategoriesArray = Array.isArray(data) ? data : (data.data || []);
      setSubcategories(subcategoriesArray);
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
      setSubcategories([]);
    }
  };

  const loadPortfolio = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/portfolio`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolio(data.portfolio || []);
      }
    } catch (error) {
      console.error('Erro ao carregar portfólio:', error);
    }
  };

  // ========== FUNÇÕES AUXILIARES ==========
  
  const mapProfileData = (userData) => {
    const mapped = {
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      city: userData.city || '',
      state: userData.state || ''
    };

    if (userData.professionalProfile) {
      const prof = userData.professionalProfile;
      mapped.category_id = prof.category_id || '';
      mapped.description = prof.description || '';
      mapped.experience = prof.experience || '';
      mapped.education = prof.education || '';
    }

    if (userData.companyProfile) {
      const comp = userData.companyProfile;
      mapped.companyName = comp.company_name || '';
      mapped.website = comp.website || '';
    }

    return mapped;
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Por favor, selecione uma imagem válida');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('A imagem deve ter no máximo 5MB');
    }
  };

  // ========== HANDLERS DE FORMULÁRIO ==========
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const newCategoryId = e.target.value;
    setProfileData(prev => ({ ...prev, category_id: newCategoryId }));
    setSelectedSubcategories([]); // Limpar subcategorias ao mudar categoria
  };

  const handleSubcategoryToggle = (subcategoryId) => {
    setSelectedSubcategories(prev =>
      prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Validações
      if (!profileData.name || !profileData.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      if (isProfessional && !profileData.category_id) {
        throw new Error('Categoria é obrigatória para profissionais');
      }

      // Atualizar dados básicos
      await updateBasicInfo();

      // Atualizar dados profissionais se for profissional
      if (isProfessional) {
        await updateProfessionalInfo();
      }

      showMessage('success', 'Perfil atualizado com sucesso!');
      setIsEditing(false);
      
      // Atualizar dados no localStorage
      const updatedUser = { ...user, name: profileData.name, email: profileData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      await loadProfile();

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      showMessage('error', error.message || 'Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBasicInfo = async () => {
    const response = await fetch(`${API_URL}/profile/basic`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        city: profileData.city,
        state: profileData.state
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar dados básicos');
    }
  };

  const updateProfessionalInfo = async () => {
    const response = await fetch(`${API_URL}/profile/professional`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        category_id: profileData.category_id,
        description: profileData.description,
        experience: profileData.experience,
        education: profileData.education,
        subcategories: selectedSubcategories
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar dados profissionais');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPortfolioForm(false);
    setPortfolioForm({ title: '', description: '', project_type: '', images: [] });
    loadProfile();
    setMessage({ type: '', text: '' });
  };

  // ========== UPLOAD DE FOTOS ==========
  
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateFile(file);

      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${API_URL}/upload/profile-photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Erro ao fazer upload');

      showMessage('success', 'Foto atualizada com sucesso!');
      await loadProfile();

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      showMessage('error', error.message || 'Erro ao fazer upload da foto');
    }
  };

  const handlePortfolioPhotosUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      // Validar todos os arquivos
      files.forEach(file => validateFile(file));

      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));

      const response = await fetch(`${API_URL}/upload/portfolio-photos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Erro ao fazer upload');

      const data = await response.json();
      
      setPortfolioForm(prev => ({
        ...prev,
        images: [...(prev.images || []), ...data.photoUrls]
      }));

      showMessage('success', `${data.photoUrls.length} foto(s) adicionada(s)!`);

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      showMessage('error', error.message || 'Erro ao fazer upload das fotos');
    }
  };

  const handleRemovePortfolioPhoto = (indexToRemove) => {
    setPortfolioForm(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  // ========== PORTFÓLIO ==========
  
  const handlePortfolioFormChange = (e) => {
    const { name, value } = e.target;
    setPortfolioForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    
    if (!portfolioForm.title) {
      showMessage('error', 'Título do projeto é obrigatório');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/profile/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(portfolioForm)
      });

      if (!response.ok) throw new Error('Erro ao adicionar item ao portfólio');

      showMessage('success', 'Item adicionado ao portfólio!');
      setShowPortfolioForm(false);
      setPortfolioForm({ title: '', description: '', project_type: '', images: [] });
      await loadPortfolio();

    } catch (error) {
      console.error('Erro ao adicionar portfólio:', error);
      showMessage('error', 'Erro ao adicionar item ao portfólio');
    }
  };

  const handleDeletePortfolio = async (itemId) => {
    if (!window.confirm('Deseja realmente remover este item do portfólio?')) return;

    try {
      const response = await fetch(`${API_URL}/profile/portfolio/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erro ao remover item');

      showMessage('success', 'Item removido do portfólio!');
      await loadPortfolio();

    } catch (error) {
      console.error('Erro ao remover portfólio:', error);
      showMessage('error', 'Erro ao remover item do portfólio');
    }
  };

  // ========== RENDER ==========

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Header */}
        <ProfileHeader 
          user={user}
          isEditing={isEditing}
          isSaving={isSaving}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancel}
          onSave={handleSubmit}
          onLogout={logout}
        />

        {/* Mensagens */}
        {message.text && (
          <MessageAlert type={message.type} text={message.text} />
        )}

        {/* Foto de Perfil */}
        <ProfilePhotoSection 
          fullUserData={fullUserData}
          profileData={profileData}
          isEditing={isEditing}
          onPhotoUpload={handlePhotoUpload}
        />

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="profile-form">
          {/* Dados Básicos */}
          <BasicInfoSection 
            profileData={profileData}
            isEditing={isEditing}
            onChange={handleChange}
          />

          {/* Dados Profissionais */}
          {isProfessional && (
            <ProfessionalInfoSection 
              profileData={profileData}
              categories={categories}
              subcategories={subcategories}
              selectedSubcategories={selectedSubcategories}
              isEditing={isEditing}
              isClient={isClient}
              onChange={handleChange}
              onCategoryChange={handleCategoryChange}
              onSubcategoryToggle={handleSubcategoryToggle}
            />
          )}

          {/* Dados da Empresa */}
          {isCompany && (
            <CompanyInfoSection 
              profileData={profileData}
              isEditing={isEditing}
              onChange={handleChange}
            />
          )}

          {/* Info Cliente Final */}
          {isClient && <ClientInfoBox />}
        </form>

        {/* Portfólio */}
        {isProfessional && (
          <PortfolioSection 
            portfolio={portfolio}
            isEditing={isEditing}
            showPortfolioForm={showPortfolioForm}
            portfolioForm={portfolioForm}
            onToggleForm={() => setShowPortfolioForm(!showPortfolioForm)}
            onFormChange={handlePortfolioFormChange}
            onAddPortfolio={handleAddPortfolio}
            onDeletePortfolio={handleDeletePortfolio}
            onPhotosUpload={handlePortfolioPhotosUpload}
            onRemovePhoto={handleRemovePortfolioPhoto}
            onCancelForm={() => {
              setShowPortfolioForm(false);
              setPortfolioForm({ title: '', description: '', project_type: '', images: [] });
            }}
          />
        )}
      </div>
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========

const ProfileHeader = ({ user, isEditing, isSaving, onEdit, onCancel, onSave, onLogout }) => (
  <div className="profile-header-section">
    <div className="profile-title-section">
      <h1 className="profile-title">Meu Perfil</h1>
      <div className="profile-type-badge">
        {user.user_type === 'professional' && <><User size={16} /> Profissional</>}
        {user.user_type === 'company' && <><Building size={16} /> Empresa</>}
        {user.user_type === 'client' && <><User size={16} /> Cliente Final</>}
      </div>
    </div>
    
    <div className="profile-actions">
      {!isEditing ? (
        <>
          <button type="button" className="btn-edit" onClick={onEdit}>
            <Edit2 size={18} />
            Editar Perfil
          </button>
          <button type="button" className="btn-logout" onClick={onLogout}>
            Sair
          </button>
        </>
      ) : (
        <>
          <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSaving}>
            <X size={18} />
            Cancelar
          </button>
          <button type="submit" className="btn-save" onClick={onSave} disabled={isSaving}>
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      )}
    </div>
  </div>
);

const MessageAlert = ({ type, text }) => (
  <div className={`profile-message ${type}`}>
    {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
    <span>{text}</span>
  </div>
);

const ProfilePhotoSection = ({ fullUserData, profileData, isEditing, onPhotoUpload }) => (
  <div className="profile-section">
    <h2 className="section-title">Foto de Perfil</h2>
    <div className="profile-photo-section">
      <div className="profile-photo-wrapper">
        <img
          src={fullUserData?.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&size=200&background=667eea&color=fff`}
          alt={profileData.name}
          className="profile-photo"
        />
        {isEditing && (
          <label className="photo-upload-overlay" htmlFor="photo-upload">
            <Camera size={24} />
            <span>Alterar foto</span>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={onPhotoUpload}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>
      <p className="photo-help-text">
        <AlertCircle size={14} />
        Formatos: JPG, PNG, WEBP - Máximo 5MB
      </p>
    </div>
  </div>
);

const BasicInfoSection = ({ profileData, isEditing, onChange }) => (
  <div className="profile-section">
    <h2 className="section-title">Dados Básicos</h2>
    
    <div className="form-row">
      <div className="form-group">
        <label htmlFor="name">Nome Completo *</label>
        <div className="input-with-icon">
          <User size={18} />
          <input
            type="text"
            id="name"
            name="name"
            value={profileData.name}
            onChange={onChange}
            disabled={!isEditing}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <div className="input-with-icon">
          <Mail size={18} />
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email}
            onChange={onChange}
            disabled={!isEditing}
            required
          />
        </div>
      </div>
    </div>

    <div className="form-row">
      <div className="form-group">
        <label htmlFor="phone">Telefone</label>
        <div className="input-with-icon">
          <Phone size={18} />
          <input
            type="tel"
            id="phone"
            name="phone"
            value={profileData.phone}
            onChange={onChange}
            disabled={!isEditing}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="city">Cidade</label>
        <div className="input-with-icon">
          <MapPin size={18} />
          <input
            type="text"
            id="city"
            name="city"
            value={profileData.city}
            onChange={onChange}
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="form-group form-group-small">
        <label htmlFor="state">UF</label>
        <input
          type="text"
          id="state"
          name="state"
          value={profileData.state}
          onChange={onChange}
          disabled={!isEditing}
          maxLength="2"
          placeholder="SP"
        />
      </div>
    </div>
  </div>
);

const ProfessionalInfoSection = ({ 
  profileData, 
  categories, 
  subcategories, 
  selectedSubcategories, 
  isEditing, 
  isClient,
  onChange, 
  onCategoryChange,
  onSubcategoryToggle 
}) => (
  <div className="profile-section">
    <h2 className="section-title">Dados Profissionais</h2>
    
    <div className="form-group">
      <label htmlFor="category_id">Categoria Principal *</label>
      <select
        id="category_id"
        name="category_id"
        value={profileData.category_id}
        onChange={onCategoryChange}
        disabled={!isEditing}
        required
      >
        <option value="">Selecione uma categoria</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
    </div>

    {/* Subcategorias */}
    {isEditing && subcategories.length > 0 && (
      <div className="form-group">
        <label>Subcategorias (opcional)</label>
        <div className="subcategories-grid">
          {subcategories.map(sub => (
            <label key={sub.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedSubcategories.includes(sub.id)}
                onChange={() => onSubcategoryToggle(sub.id)}
              />
              <span>{sub.name}</span>
            </label>
          ))}
        </div>
      </div>
    )}

    {/* Mostrar subcategorias selecionadas quando não está editando */}
    {!isEditing && selectedSubcategories.length > 0 && subcategories.length > 0 && (
      <div className="form-group">
        <label>Subcategorias</label>
        <div className="selected-subcategories">
          {selectedSubcategories.map(id => {
            const sub = subcategories.find(s => s.id === id);
            return sub ? (
              <span key={id} className="subcategory-tag">{sub.name}</span>
            ) : null;
          })}
        </div>
      </div>
    )}

    <div className="form-group">
      <label htmlFor="description">Descrição dos Serviços</label>
      <textarea
        id="description"
        name="description"
        value={profileData.description}
        onChange={onChange}
        disabled={!isEditing}
        rows="4"
        placeholder="Descreva os serviços que você oferece..."
      />
    </div>

    <div className="form-group">
      <label htmlFor="experience">Experiência Profissional</label>
      <textarea
        id="experience"
        name="experience"
        value={profileData.experience}
        onChange={onChange}
        disabled={!isEditing}
        rows="4"
        placeholder="Conte sobre sua experiência..."
      />
    </div>

    <div className="form-group">
      <label htmlFor="education">Formação e Certificações</label>
      <textarea
        id="education"
        name="education"
        value={profileData.education}
        onChange={onChange}
        disabled={!isEditing}
        rows="4"
        placeholder="Sua formação acadêmica e certificações..."
      />
    </div>
  </div>
);

const CompanyInfoSection = ({ profileData, isEditing, onChange }) => (
  <div className="profile-section">
    <h2 className="section-title">Dados da Empresa</h2>
    
    <div className="form-group">
      <label htmlFor="companyName">Nome da Empresa</label>
      <div className="input-with-icon">
        <Building size={18} />
        <input
          type="text"
          id="companyName"
          name="companyName"
          value={profileData.companyName}
          onChange={onChange}
          disabled={!isEditing}
        />
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="website">Website (opcional)</label>
      <input
        type="url"
        id="website"
        name="website"
        value={profileData.website}
        onChange={onChange}
        disabled={!isEditing}
        placeholder="https://www.suaempresa.com.br"
      />
    </div>
  </div>
);

const ClientInfoBox = () => (
  <div className="profile-info-box">
    <AlertCircle size={20} />
    <div>
      <strong>Conta de Cliente Final</strong>
      <p>
        Você pode editar suas informações pessoais, mas não pode mudar seu tipo de conta. 
        Para solicitar mudanças de categoria ou exclusão da conta, envie um email para suporte@catalogopro.com
      </p>
    </div>
  </div>
);

const PortfolioSection = ({ 
  portfolio, 
  isEditing, 
  showPortfolioForm, 
  portfolioForm,
  onToggleForm,
  onFormChange,
  onAddPortfolio,
  onDeletePortfolio,
  onPhotosUpload,
  onRemovePhoto,
  onCancelForm
}) => (
  <div className="profile-section">
    <div className="section-header-with-action">
      <h2 className="section-title">Portfólio</h2>
      {isEditing && (
        <button 
          type="button"
          className="btn-add-portfolio"
          onClick={onToggleForm}
        >
          <Plus size={18} />
          Adicionar Projeto
        </button>
      )}
    </div>

    {!isEditing && portfolio.length === 0 && (
      <p className="portfolio-info-text">Clique em "Editar Perfil" para adicionar projetos ao seu portfólio</p>
    )}

    {/* Formulário Portfolio */}
    {isEditing && showPortfolioForm && (
      <PortfolioForm 
        portfolioForm={portfolioForm}
        onChange={onFormChange}
        onSubmit={onAddPortfolio}
        onCancel={onCancelForm}
        onPhotosUpload={onPhotosUpload}
        onRemovePhoto={onRemovePhoto}
      />
    )}

    {/* Lista Portfolio */}
    {portfolio.length === 0 && isEditing && !showPortfolioForm ? (
      <div className="portfolio-empty">
        <ImageIcon size={48} />
        <p>Nenhum projeto adicionado ainda</p>
        <small>Clique em "Adicionar Projeto" para começar</small>
      </div>
    ) : (
      <PortfolioGrid 
        portfolio={portfolio}
        isEditing={isEditing}
        onDelete={onDeletePortfolio}
      />
    )}
  </div>
);

const PortfolioForm = ({ 
  portfolioForm, 
  onChange, 
  onSubmit, 
  onCancel, 
  onPhotosUpload, 
  onRemovePhoto 
}) => (
  <form onSubmit={onSubmit} className="portfolio-form">
    <div className="form-group">
      <label htmlFor="portfolio-title">Título do Projeto *</label>
      <input
        type="text"
        id="portfolio-title"
        name="title"
        value={portfolioForm.title}
        onChange={onChange}
        placeholder="Ex: Reforma residencial completa"
        required
      />
    </div>

    <div className="form-group">
      <label htmlFor="portfolio-description">Descrição</label>
      <textarea
        id="portfolio-description"
        name="description"
        value={portfolioForm.description}
        onChange={onChange}
        rows="3"
        placeholder="Descreva o projeto..."
      />
    </div>

    <div className="form-group">
      <label htmlFor="portfolio-type">Tipo de Projeto</label>
      <input
        type="text"
        id="portfolio-type"
        name="project_type"
        value={portfolioForm.project_type}
        onChange={onChange}
        placeholder="Ex: Residencial, Comercial, Industrial"
      />
    </div>

    {/* Upload de fotos */}
    <div className="form-group">
      <label>Fotos do Projeto</label>
      <div className="photo-upload-area">
        <label htmlFor="portfolio-photos" className="photo-upload-button">
          <ImageIcon size={20} />
          Adicionar Fotos
          <input
            type="file"
            id="portfolio-photos"
            accept="image/*"
            multiple
            onChange={onPhotosUpload}
            style={{ display: 'none' }}
          />
        </label>
        <small>Máximo 10 fotos - 5MB cada</small>
      </div>

      {/* Preview das fotos */}
      {portfolioForm.images?.length > 0 && (
        <div className="photo-preview-grid">
          {portfolioForm.images.map((url, index) => (
            <div key={index} className="photo-preview-item">
              <img src={url} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className="remove-photo-btn"
                onClick={() => onRemovePhoto(index)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="portfolio-form-actions">
      <button type="button" className="btn-cancel" onClick={onCancel}>
        Cancelar
      </button>
      <button type="submit" className="btn-save">
        Adicionar
      </button>
    </div>
  </form>
);

const PortfolioGrid = ({ portfolio, isEditing, onDelete }) => (
  <div className="portfolio-grid">
    {portfolio.map(item => (
      <div key={item.id} className="portfolio-item">
        {item.images?.length > 0 && (
          <div className="portfolio-item-images">
            <img 
              src={item.images[0]} 
              alt={item.title}
              className="portfolio-main-image"
            />
            {item.images.length > 1 && (
              <div className="portfolio-image-count">
                <ImageIcon size={14} />
                {item.images.length}
              </div>
            )}
          </div>
        )}
        
        <div className="portfolio-item-content">
          <div className="portfolio-item-header">
            <h3>{item.title}</h3>
            {isEditing && (
              <button
                type="button"
                className="btn-delete-portfolio"
                onClick={() => onDelete(item.id)}
                title="Remover projeto"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          {item.description && <p className="portfolio-item-description">{item.description}</p>}
          {item.project_type && (
            <span className="portfolio-item-type">{item.project_type}</span>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default Profile;