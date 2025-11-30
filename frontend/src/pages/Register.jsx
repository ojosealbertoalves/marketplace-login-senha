// frontend/src/pages/Register.jsx - SEM EMPRESA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, EyeOff, AlertCircle, UserCircle } from 'lucide-react';
import { register } from '../services/api';
import { states, getCitiesByState } from '../data/locations';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('professional');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [availableCities, setAvailableCities] = useState([]);
  const [availableClientCities, setAvailableClientCities] = useState([]);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    // Profissional
    cpf: '', categoryId: '', subcategoryIds: [], city: '', state: '', description: '', experience: '', education: '',
    // Cliente Final
    documento: '', clientPhone: '', clientCity: '', clientState: ''
  });

  useEffect(() => {
    fetch('http://localhost:3001/api/categories')
      .then(res => res.json())
      .then(data => {
        const categoriesArray = Array.isArray(data) ? data : (data.data || []);
        console.log('📋 Categorias carregadas:', categoriesArray);
        setCategories(categoriesArray);
      })
      .catch(err => console.error('Erro ao carregar categorias:', err));
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      fetch(`http://localhost:3001/api/subcategories?category_id=${formData.categoryId}`)
        .then(res => res.json())
        .then(data => {
          const subcategoriesArray = Array.isArray(data) ? data : (data.data || []);
          console.log('📋 Subcategorias carregadas:', subcategoriesArray);
          setSubcategories(subcategoriesArray);
        })
        .catch(err => console.error('Erro ao carregar subcategorias:', err));
    }
  }, [formData.categoryId]);

  useEffect(() => {
    if (formData.state) {
      const cities = getCitiesByState(formData.state);
      setAvailableCities(cities);
      if (!cities.find(c => c.value === formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.state]);

  useEffect(() => {
    if (formData.clientState) {
      const cities = getCitiesByState(formData.clientState);
      setAvailableClientCities(cities);
      if (!cities.find(c => c.value === formData.clientCity)) {
        setFormData(prev => ({ ...prev, clientCity: '' }));
      }
    } else {
      setAvailableClientCities([]);
    }
  }, [formData.clientState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const formatters = {
    cpf: (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
    phone: (v) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2')
  };

  const handleFormatChange = (field, formatter) => (e) => {
    setFormData(prev => ({ ...prev, [field]: formatter(e.target.value) }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirme sua senha';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';

    if (userType === 'professional') {
      if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
      else if (formData.cpf.replace(/\D/g, '').length !== 11) newErrors.cpf = 'CPF deve ter 11 dígitos';
      if (!formData.categoryId) newErrors.categoryId = 'Categoria é obrigatória';
      if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';
      if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
      if (!formData.description.trim()) newErrors.description = 'Descrição dos serviços é obrigatória';
      if (!formData.experience.trim()) newErrors.experience = 'Experiência é obrigatória';
      if (!formData.education.trim()) newErrors.education = 'Formação é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType
      };

      if (userType === 'professional') {
        Object.assign(userData, {
          cpf: formData.cpf.replace(/\D/g, ''),
          category_id: formData.categoryId,
          city: formData.city.trim(),
          state: formData.state.trim().toUpperCase(),
          description: formData.description.trim(),
          experience: formData.experience.trim(),
          education: formData.education.trim()
        });
      }

      if (userType === 'client') {
        Object.assign(userData, {
          documento: formData.documento.replace(/\D/g, ''),
          clientPhone: formData.clientPhone.replace(/\D/g, ''),
          clientCity: formData.clientCity.trim(),
          clientState: formData.clientState.trim().toUpperCase()
        });
      }

      console.log('🚀 Enviando dados:', userData);

      const result = await register(userData);
      
      if (result.success) {
        console.log('✅ Cadastro realizado com sucesso!');
        navigate('/');
      } else {
        console.error('❌ Erro no cadastro:', result.error);
        setErrors({ submit: result.error || 'Erro ao criar conta' });
      }
    } catch (error) {
      console.error('💥 Erro no cadastro:', error);
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-header">
          <div className="register-logo">
            <span className="logo-icon">🏗️</span>
            <span className="logo-text">CatálogoPro</span>
          </div>
          <h1 className="register-title">Criar Conta</h1>
          <p className="register-subtitle">Junte-se à maior plataforma de profissionais da construção civil</p>
        </div>

        <div className="user-type-selector">
          <button type="button" className={`type-button ${userType === 'professional' ? 'active' : ''}`} onClick={() => setUserType('professional')}>
            <User size={20} />
            <span>Profissional</span>
          </button>
          <button type="button" className={`type-button ${userType === 'client' ? 'active' : ''}`} onClick={() => setUserType('client')}>
            <UserCircle size={20} />
            <span>Cliente Final</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {errors.submit && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              {userType === 'professional' ? 'Nome Completo' : 'Seu Nome'}
            </label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Digite seu nome completo" />
            </div>
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`form-input ${errors.email ? 'error' : ''}`} placeholder="seu@email.com" />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <div className="input-wrapper">
              <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Mínimo 6 caracteres" />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirmar Senha</label>
            <div className="input-wrapper">
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Digite a senha novamente" />
              <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {userType === 'professional' && (
            <>
              <div className="form-group">
                <label htmlFor="cpf" className="form-label">CPF</label>
                <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleFormatChange('cpf', formatters.cpf)} className={`form-input ${errors.cpf ? 'error' : ''}`} placeholder="000.000.000-00" maxLength="14" />
                {errors.cpf && <span className="error-message">{errors.cpf}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="categoryId" className="form-label">Categoria</label>
                <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className={`form-input ${errors.categoryId ? 'error' : ''}`}>
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="state" className="form-label">Estado</label>
                  <select id="state" name="state" value={formData.state} onChange={handleChange} className={`form-input ${errors.state ? 'error' : ''}`}>
                    <option value="">Selecione o estado</option>
                    {states.map(state => (
                      <option key={state.value} value={state.value}>{state.label}</option>
                    ))}
                  </select>
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="city" className="form-label">Cidade</label>
                  <select id="city" name="city" value={formData.city} onChange={handleChange} className={`form-input ${errors.city ? 'error' : ''}`} disabled={!formData.state}>
                    <option value="">{formData.state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
                    {availableCities.map(city => (
                      <option key={city.value} value={city.value}>{city.label}</option>
                    ))}
                  </select>
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Descrição dos Serviços</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={`form-input ${errors.description ? 'error' : ''}`} placeholder="Descreva os serviços que você oferece" rows="3" />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="experience" className="form-label">Experiência</label>
                <textarea id="experience" name="experience" value={formData.experience} onChange={handleChange} className={`form-input ${errors.experience ? 'error' : ''}`} placeholder="Conte sobre sua experiência profissional" rows="3" />
                {errors.experience && <span className="error-message">{errors.experience}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="education" className="form-label">Formação</label>
                <textarea id="education" name="education" value={formData.education} onChange={handleChange} className={`form-input ${errors.education ? 'error' : ''}`} placeholder="Sua formação e certificações" rows="3" />
                {errors.education && <span className="error-message">{errors.education}</span>}
              </div>
            </>
          )}

          {userType === 'client' && (
            <>
              <div className="form-group">
                <label htmlFor="documento" className="form-label">CPF</label>
                <input type="text" id="documento" name="documento" value={formData.documento} onChange={handleFormatChange('documento', formatters.cpf)} className="form-input" placeholder="000.000.000-00" maxLength="14" />
              </div>

              <div className="form-group">
                <label htmlFor="clientPhone" className="form-label">Telefone</label>
                <input type="text" id="clientPhone" name="clientPhone" value={formData.clientPhone} onChange={handleFormatChange('clientPhone', formatters.phone)} className="form-input" placeholder="(00) 00000-0000" maxLength="15" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="clientState" className="form-label">Estado</label>
                  <select id="clientState" name="clientState" value={formData.clientState} onChange={handleChange} className="form-input">
                    <option value="">Selecione o estado</option>
                    {states.map(state => (
                      <option key={state.value} value={state.value}>{state.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="clientCity" className="form-label">Cidade</label>
                  <select id="clientCity" name="clientCity" value={formData.clientCity} onChange={handleChange} className="form-input" disabled={!formData.clientState}>
                    <option value="">{formData.clientState ? 'Selecione a cidade' : 'Selecione o estado primeiro'}</option>
                    {availableClientCities.map(city => (
                      <option key={city.value} value={city.value}>{city.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="info-box">
                <AlertCircle size={20} />
                <div>
                  <strong>Conta de Cliente Final</strong>
                  <p>Como cliente, você poderá visualizar todos os profissionais, acessar informações de contato, mas seu perfil não aparecerá nas buscas.</p>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <p className="login-link">
            Já tem uma conta? <a href="/login">Faça login</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;