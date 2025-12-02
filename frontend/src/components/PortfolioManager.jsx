// frontend/src/components/PortfolioManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './PortfolioManager.css';
import { API_BASE_URL } from '../config';

const PortfolioManager = ({ professionalId }) => {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_type: '',
    area: '',
    duration: '',
    tags: [],
    images: []
  });

  const API_URL = API_BASE_URL;

  // Carregar portfolio
  useEffect(() => {
    loadPortfolio();
  }, [professionalId]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/portfolio/${professionalId}`);
      
      if (response.data.success) {
        setPortfolioItems(response.data.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar portfolio:', error);
      alert('Erro ao carregar portfolio');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para criar/editar
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        description: item.description || '',
        project_type: item.project_type || '',
        area: item.area || '',
        duration: item.duration || '',
        tags: item.tags || [],
        images: item.images || []
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        project_type: '',
        area: '',
        duration: '',
        tags: [],
        images: []
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setSelectedImages([]);
    setFormData({
      title: '',
      description: '',
      project_type: '',
      area: '',
      duration: '',
      tags: [],
      images: []
    });
  };

  // Upload de imagens
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const formDataUpload = new FormData();
    files.forEach(file => {
      formDataUpload.append('images', file);
    });

    try {
      setUploadingImages(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/portfolio/${professionalId}/upload`,
        formDataUpload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        const uploadedUrls = response.data.data.images;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
        alert('Imagens enviadas com sucesso!');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      alert('Erro ao fazer upload das imagens');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remover imagem
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Adicionar tag
  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  // Remover tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Salvar item
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert('Título e descrição são obrigatórios');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let response;

      if (editingItem) {
        // Atualizar item existente
        response = await axios.put(
          `${API_URL}/portfolio/${professionalId}/${editingItem.id}`,
          formData,
          config
        );
      } else {
        // Criar novo item
        response = await axios.post(
          `${API_URL}/portfolio/${professionalId}`,
          formData,
          config
        );
      }

      if (response.data.success) {
        alert(editingItem ? 'Projeto atualizado!' : 'Projeto adicionado!');
        loadPortfolio();
        closeModal();
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert('Erro ao salvar projeto');
    }
  };

  // Deletar item
  const handleDelete = async (itemId) => {
    if (!window.confirm('Tem certeza que deseja deletar este projeto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/portfolio/${professionalId}/${itemId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert('Projeto deletado com sucesso');
        loadPortfolio();
      }
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      alert('Erro ao deletar projeto');
    }
  };

  if (loading) {
    return <div className="loading">Carregando portfolio...</div>;
  }

  return (
    <div className="portfolio-manager">
      <div className="portfolio-header">
        <h2>Meu Portfolio</h2>
        <button className="btn-add" onClick={() => openModal()}>
          + Adicionar Projeto
        </button>
      </div>

      <div className="portfolio-grid">
        {portfolioItems.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum projeto no portfolio ainda</p>
            <button onClick={() => openModal()}>Adicionar primeiro projeto</button>
          </div>
        ) : (
          portfolioItems.map(item => (
            <div key={item.id} className="portfolio-card">
              <div className="card-image">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.title} />
                ) : (
                  <div className="no-image">Sem imagem</div>
                )}
                <div className="image-count">
                  📷 {item.images?.length || 0}
                </div>
              </div>
              
              <div className="card-content">
                <h3>{item.title}</h3>
                <p className="description">{item.description}</p>
                
                {item.project_type && (
                  <span className="badge">{item.project_type}</span>
                )}
                
                {item.tags && item.tags.length > 0 && (
                  <div className="tags">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button onClick={() => openModal(item)} className="btn-edit">
                  ✏️ Editar
                </button>
                <button onClick={() => handleDelete(item.id)} className="btn-delete">
                  🗑️ Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Editar Projeto' : 'Novo Projeto'}</h2>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="portfolio-form">
              <div className="form-group">
                <label>Título do Projeto *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Casa Alto Padrão"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva o projeto..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Projeto</label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData({...formData, project_type: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="Residencial">Residencial</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Reforma">Reforma</option>
                    <option value="Construção">Construção</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Área (m²)</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    placeholder="Ex: 450m²"
                  />
                </div>

                <div className="form-group">
                  <label>Duração</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="Ex: 12 meses"
                  />
                </div>
              </div>

              {/* Upload de Imagens */}
              <div className="form-group">
                <label>Imagens do Projeto</label>
                <div className="upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="image-upload"
                    disabled={uploadingImages}
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    {uploadingImages ? '📤 Enviando...' : '📷 Escolher Imagens'}
                  </label>
                </div>

                <div className="images-preview">
                  {formData.images.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img src={image} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => removeImage(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="form-group">
                <label>Tags</label>
                <div className="tag-input">
                  <input
                    type="text"
                    placeholder="Adicionar tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <div className="tags-list">
                  {formData.tags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editingItem ? '💾 Salvar Alterações' : '➕ Adicionar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;