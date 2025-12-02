// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, ArrowLeft, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import './ForgotPassword.css';
import { API_BASE_URL } from '../config';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetCode, setResetCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setErrors({ email: 'Email é obrigatório' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        setSuccessMessage('Código enviado para seu email!');
      } else {
        setErrors({ submit: data.error || 'Erro ao enviar código' });
      }
    } catch (error) {
      console.error('Erro:', error);
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!formData.code) {
      setErrors({ code: 'Código é obrigatório' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          code: formData.code 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStep(3);
        setSuccessMessage('Código verificado! Agora defina sua nova senha.');
      } else {
        setErrors({ submit: data.error || 'Código inválido' });
      }
    } catch (error) {
      console.error('Erro:', error);
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          code: formData.code,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Senha alterada com sucesso! Redirecionando...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrors({ submit: data.error || 'Erro ao resetar senha' });
      }
    } catch (error) {
      console.error('Erro:', error);
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(resetCode);
    alert('Código copiado!');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <div className="forgot-password-header">
          <Link to="/login" className="back-link">
            <ArrowLeft size={20} />
            <span>Voltar ao login</span>
          </Link>
          
          <div className="forgot-password-logo">
            <span className="logo-icon">🏗️</span>
            <span className="logo-text">CatálogoPro</span>
          </div>

          <h1 className="forgot-password-title">
            {step === 1 && 'Recuperar Senha'}
            {step === 2 && 'Verificar Código'}
            {step === 3 && 'Nova Senha'}
          </h1>
          
          <p className="forgot-password-subtitle">
            {step === 1 && 'Digite seu email para receber o código de recuperação'}
            {step === 2 && 'Digite o código de 6 dígitos enviado para seu email'}
            {step === 3 && 'Defina sua nova senha'}
          </p>
        </div>

        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {successMessage && (
          <div className="success-banner">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {errors.submit && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{errors.submit}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmitEmail} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
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
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando código...' : 'Enviar Código'}
            </button>
          </form>
        )}

        {step === 2 && (
          <>
            <div className="code-instructions">
              <p className="code-hint">
                📧 Verifique seu email e digite o código de 6 dígitos que você recebeu.
              </p>
              <p className="code-hint-secondary">
                ⚠️ O código expira em 30 minutos
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="code" className="form-label">Digite o Código</label>
                <div className="input-wrapper">
                  <Key className="input-icon" />
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`form-input ${errors.code ? 'error' : ''}`}
                    placeholder="000000"
                    maxLength="6"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.code && <span className="error-message">{errors.code}</span>}
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verificando...' : 'Verificar Código'}
              </button>

              <button 
                type="button"
                className="back-step-button"
                onClick={() => {
                  setStep(1);
                  setFormData(prev => ({ ...prev, code: '' }));
                  setSuccessMessage('');
                }}
              >
                Enviar novo código
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">Nova Senha</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.newPassword ? 'error' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSubmitting}
                />
              </div>
              {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirmar Nova Senha</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Digite a senha novamente"
                  disabled={isSubmitting}
                />
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Alterando senha...' : 'Alterar Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;