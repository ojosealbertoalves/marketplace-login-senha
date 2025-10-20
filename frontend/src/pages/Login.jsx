// frontend/src/pages/Login.jsx - CORRIGIDO
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
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
      // ✅ CORRIGIDO: Passar formData como objeto
      const result = await login(formData);
      
      if (result.success) {
        // Redirecionar para onde estava tentando acessar ou página inicial
        const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        setErrors({ 
          submit: result.error || 'Erro ao fazer login' 
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setErrors({ 
        submit: 'Erro de conexão. Tente novamente.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">🏗️</span>
            <span className="logo-text">CatálogoPro</span>
          </div>
          <h1 className="login-title">Fazer Login</h1>
          <p className="login-subtitle">
            Acesse sua conta para ver contatos dos profissionais
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.submit && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <span>{errors.submit}</span>
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
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              {/* ✨ LINK ESQUECI MINHA SENHA */}
              <Link to="/esqueci-senha" className="forgot-password-link">
                Esqueci minha senha
              </Link>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Sua senha"
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
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="loading-spinner" />
            ) : (
              <>
                <LogIn size={20} />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="signup-prompt">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="signup-link">
              Cadastre-se aqui
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

export default Login;