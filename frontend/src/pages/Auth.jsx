// frontend/src/pages/Auth.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Building2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados principais
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    // Campos comuns
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    state: '',
    userType: 'professional', // 'professional', 'company', 'admin'
    
    // Campos específicos para profissionais
    category_id: '',
    subcategories: [],
    description: '',
    experience: '',
    education: '',
    
    // Campos específicos para empresas
    companyName: '',
    cnpj: '',
    website: '',
    businessAreas: []
  });

  // Estados das opções
  const [categories] = useState([
    { id: 'cat-obras-reformas', name: '🏗️ Obras e Reformas' },
    { id: 'cat-eletrica-hidraulica', name: '⚡ Elétrica e Hidráulica' },
    { id: 'cat-arquitetura-design', name: '🏠 Arquitetura e Design' },
    { id: 'cat-pintura-revestimentos', name: '🎨 Pintura e Revestimentos' },
    { id: 'cat-marcenaria', name: '🪚 Marcenaria e Carpintaria' }
  ]);

  const [states] = useState([
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...(prev[name] || []), value]
          : (prev[name] || []).filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    setError('');
    
    // Validações básicas
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return false;
    }
    
    if (!isLogin) {
      if (!formData.password || formData.password.length < 6) {
        setError('Senha deve ter pelo menos 6 caracteres');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Senhas não coincidem');
        return false;
      }
      
      // Validações específicas por tipo
      if (formData.userType === 'professional') {
        if (!formData.category_id) {
          setError('Selecione uma categoria');
          return false;
        }
      }
      
      if (formData.userType === 'company') {
        if (!formData.companyName.trim()) {
          setError('Nome da empresa é obrigatório');
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;
      
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Sucesso - salvar token e redirecionar
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess(isLogin ? 'Login realizado com sucesso!' : 'Cadastro realizado com sucesso!');
        
        // Redirecionar baseado no tipo de usuário
        setTimeout(() => {
          const redirectPath = location.state?.from || '/';
          if (data.user.user_type === 'admin') {
            navigate('/admin');
          } else {
            navigate(redirectPath);
          }
        }, 1500);
        
      } else {
        setError(data.error || 'Erro desconhecido');
      }
      
    } catch (error) {
      console.error('Erro na autenticação:', error);
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    // Limpar alguns campos específicos do cadastro
    if (isLogin) {
      setFormData(prev => ({
        ...prev,
        confirmPassword: '',
        userType: 'professional',
        category_id: '',
        companyName: ''
      }));
    }
  };

  return (
    <div className="auth-container">
      {/* Header */}
      <header className="auth-header">
        <button
          onClick={() => navigate('/')}
          className="back-button"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        
        <div className="auth-logo">
          <h1>🏗️ Marketplace</h1>
          <p>Construção Civil</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="auth-main">
        <div className="auth-card">
          {/* Toggle Buttons */}
          <div className="auth-toggle">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            >
              Cadastrar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Messages */}
            {error && (
              <div className="message error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="message success">
                <CheckCircle size={18} />
                <span>{success}</span>
              </div>
            )}

            {/* Campos básicos */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Nome Completo *</label>
                <div className="input-wrapper">
                  <User size={20} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <div className="input-wrapper">
                <Mail size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha *</label>
              <div className="input-wrapper">
                <Lock size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmação de senha - apenas no cadastro */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Senha *</label>
                <div className="input-wrapper">
                  <Lock size={20} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Campos específicos do cadastro */}
            {!isLogin && (
              <>
                {/* Tipo de usuário */}
                <div className="form-group">
                  <label>Tipo de Cadastro *</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="userType"
                        value="professional"
                        checked={formData.userType === 'professional'}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                      <span>👷 Profissional</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="userType"
                        value="company"
                        checked={formData.userType === 'company'}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                      <span>🏢 Empresa</span>
                    </label>
                  </div>
                </div>

                {/* Campos comuns */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Telefone</label>
                    <div className="input-wrapper">
                      <Phone size={20} />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">Estado</label>
                    <div className="input-wrapper">
                      <MapPin size={20} />
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={loading}
                      >
                        <option value="">Selecione</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="city">Cidade</label>
                  <div className="input-wrapper">
                    <MapPin size={20} />
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Sua cidade"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Campos específicos para profissionais */}
                {formData.userType === 'professional' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="category_id">Categoria Principal *</label>
                      <div className="input-wrapper">
                        <Building2 size={20} />
                        <select
                          id="category_id"
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleInputChange}
                          disabled={loading}
                        >
                          <option value="">Selecione sua área</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Descrição dos Serviços</label>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Descreva brevemente seus serviços e experiência..."
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={loading}
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {/* Campos específicos para empresas */}
                {formData.userType === 'company' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="companyName">Nome da Empresa *</label>
                      <div className="input-wrapper">
                        <Building2 size={20} />
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          placeholder="Nome da sua empresa"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="cnpj">CNPJ</label>
                        <input
                          id="cnpj"
                          name="cnpj"
                          type="text"
                          placeholder="00.000.000/0000-00"
                          value={formData.cnpj}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="website">Website</label>
                        <input
                          id="website"
                          name="website"
                          type="url"
                          placeholder="https://suaempresa.com"
                          value={formData.website}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="spin" />
                  <span>{isLogin ? 'Entrando...' : 'Cadastrando...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
              )}
            </button>

            {/* Toggle Mode */}
            <div className="form-footer">
              <p>
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="toggle-link"
                  disabled={loading}
                >
                  {isLogin ? 'Cadastre-se' : 'Faça login'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Auth;