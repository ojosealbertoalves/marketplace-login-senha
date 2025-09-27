// frontend/src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Lock, Mail, User, UserPlus, AlertCircle, Building, 
  MapPin, FileText, GraduationCap, Briefcase 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import './Register.css';

const Register = () => {
  const [userType, setUserType] = useState('professional'); // professional ou company
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Campos específicos para profissional
    cpf: '',
    categoryId: '',
    city: '',
    state: '',
    description: '',
    experience: '',
    education: '',
    
    // Campos específicos para empresa
    companyName: '',
    cnpj: '',
    website: '',
    phone: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Carregar categorias para profissionais
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await apiService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    if (userType === 'professional') {
      loadCategories();
    }
  }, [userType]);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação de CPF e CNPJ
    let formattedValue = value;
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Formatação de CPF
  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4]]
        .filter(Boolean)
        .join('.')
        .replace(/\.(\d{2})$/, '-$1');
    }
    return cleaned;
  };

  // Formatação de CNPJ
  const formatCNPJ = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4], match[5]]
        .filter(Boolean)
        .join('.')
        .replace(/\.(\d{4})\.(\d{2})$/, '/$1-$2');
    }
    return cleaned;
  };

  // Formatação de telefone
  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})$/);
    if (match) {
      const formatted = [match[1], match[2], match[3], match[4]]
        .filter(Boolean)
        .join(' ')
        .replace(/^(\d{2}) /, '($1) ')
        .replace(/(\d{1}) (\d{4}) /, '$1 $2-');
      return formatted;
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validações básicas
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    // Validações específicas por tipo de usuário
    if (userType === 'professional') {
      if (!formData.cpf.trim()) {
        newErrors.cpf = 'CPF é obrigatório';
      } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
        newErrors.cpf = 'CPF deve ter 11 dígitos';
      }

      if (!formData.categoryId) {
        newErrors.categoryId = 'Categoria é obrigatória';
      }

      if (!formData.city.trim()) {
        newErrors.city = 'Cidade é obrigatória';
      }

      if (!formData.state.trim()) {
        newErrors.state = 'Estado é obrigatório';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Descrição dos serviços é obrigatória';
      }

      if (!formData.experience.trim()) {
        newErrors.experience = 'Experiência é obrigatória';
      }

      if (!formData.education.trim()) {
        newErrors.education = 'Formação é obrigatória';
      }
    }

    if (userType === 'company') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Nome da empresa é obrigatório';
      }

      if (!formData.cnpj.trim()) {
        newErrors.cnpj = 'CNPJ é obrigatório';
      } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
        newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Telefone é obrigatório';
      }
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
        userType,
        
        // Campos específicos baseado no tipo
        ...(userType === 'professional' && {
          cpf: formData.cpf,
          category_id: formData.categoryId,
          city: formData.city.trim(),
          state: formData.state.trim(),
          description: formData.description.trim(),
          experience: formData.experience.trim(),
          education: formData.education.trim()
        }),
        
        ...(userType === 'company' && {
          companyName: formData.companyName.trim(),
          cnpj: formData.cnpj,
          website: formData.website.trim(),
          phone: formData.phone
        })
      };

      const result = await register(userData);
      
      if (result.success) {
        navigate('/');
      } else {
        setErrors({ 
          submit: result.error || 'Erro ao criar conta' 
        });
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setErrors({ 
        submit: 'Erro de conexão. Tente novamente.' 
      });
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
          <p className="register-subtitle">
            Junte-se à maior plataforma de profissionais da construção civil
          </p>
        </div>

        {/* Seletor de tipo de usuário */}
        <div className="user-type-selector">
          <button
            type="button"
            className={`type-button ${userType === 'professional' ? 'active' : ''}`}
            onClick={() => setUserType('professional')}
          >
            <User size={20} />
            <span>Sou Profissional</span>
          </button>
          <button
            type="button"
            className={`type-button ${userType === 'company' ? 'active' : ''}`}
            onClick={() => setUserType('company')}
          >
            <Building size={20} />
            <span>Sou Empresa</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {errors.submit && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Campos básicos */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              {userType === 'professional' ? 'Nome Completo' : 'Nome do Responsável'}
            </label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Seu nome completo"
                disabled={isSubmitting}
              />
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {userType === 'company' && (
            <div className="form-group">
              <label htmlFor="companyName" className="form-label">
                Nome da Empresa
              </label>
              <div className="input-wrapper">
                <Building className="input-icon" />
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`form-input ${errors.companyName ? 'error' : ''}`}
                  placeholder="Nome da sua empresa"
                  disabled={isSubmitting}
                />
              </div>
              {errors.companyName && <span className="error-text">{errors.companyName}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="seu@email.com"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* CPF ou CNPJ */}
          <div className="form-group">
            <label htmlFor={userType === 'professional' ? 'cpf' : 'cnpj'} className="form-label">
              {userType === 'professional' ? 'CPF' : 'CNPJ'}
            </label>
            <div className="input-wrapper">
              <FileText className="input-icon" />
              <input
                type="text"
                id={userType === 'professional' ? 'cpf' : 'cnpj'}
                name={userType === 'professional' ? 'cpf' : 'cnpj'}
                value={userType === 'professional' ? formData.cpf : formData.cnpj}
                onChange={handleChange}
                className={`form-input ${errors.cpf || errors.cnpj ? 'error' : ''}`}
                placeholder={userType === 'professional' ? '000.000.000-00' : '00.000.000/0000-00'}
                disabled={isSubmitting}
                maxLength={userType === 'professional' ? 14 : 18}
              />
            </div>
            {(errors.cpf || errors.cnpj) && (
              <span className="error-text">{errors.cpf || errors.cnpj}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Senha
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Digite a senha novamente"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Campos específicos para profissional */}
          {userType === 'professional' && (
            <>
              <div className="form-group">
                <label htmlFor="categoryId" className="form-label">
                  Categoria Principal
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`form-input ${errors.categoryId ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Selecione sua categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    Cidade
                  </label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon" />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`form-input ${errors.city ? 'error' : ''}`}
                      placeholder="Sua cidade"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="state" className="form-label">
                    Estado
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`form-input ${errors.state ? 'error' : ''}`}
                    placeholder="Ex: SP, RJ, MG"
                    disabled={isSubmitting}
                    maxLength={2}
                  />
                  {errors.state && <span className="error-text">{errors.state}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Descrição dos Serviços
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder="Descreva os serviços que você oferece..."
                  rows="3"
                  disabled={isSubmitting}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="experience" className="form-label">
                  Experiência Profissional
                </label>
                <div className="input-wrapper">
                  <Briefcase className="input-icon" />
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`form-textarea ${errors.experience ? 'error' : ''}`}
                    placeholder="Descreva sua experiência profissional..."
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.experience && <span className="error-text">{errors.experience}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="education" className="form-label">
                  Formação
                </label>
                <div className="input-wrapper">
                  <GraduationCap className="input-icon" />
                  <textarea
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className={`form-textarea ${errors.education ? 'error' : ''}`}
                    placeholder="Descreva sua formação acadêmica e cursos..."
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.education && <span className="error-text">{errors.education}</span>}
              </div>
            </>
          )}

          {/* Campos específicos para empresa */}
          {userType === 'company' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Telefone da Empresa
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="(11) 9 9999-9999"
                    disabled={isSubmitting}
                    maxLength={16}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="website" className="form-label">
                    Site da Empresa (Opcional)
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://www.suaempresa.com.br"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="loading-spinner" />
            ) : (
              <>
                <UserPlus size={20} />
                <span>Criar Conta</span>
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p className="login-prompt">
            Já tem uma conta?{' '}
            <Link to="/login" className="login-link">
              Faça login aqui
            </Link>
          </p>
          
          <div className="divider">
            <span>ou</span>
          </div>
          
          <Link to="/" className="back-home">
            Voltar à página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;