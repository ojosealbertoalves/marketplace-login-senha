// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, ArrowLeft, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: código, 3: nova senha
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetCode, setResetCode] = useState(''); // Código gerado pelo backend
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

  // PASSO 1: Enviar email
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setErrors({ email: 'Email é obrigatório' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar o código que veio do backend
        setResetCode(data.resetCode);
        setStep(2);
        setSuccessMessage('Código gerado com sucesso!');
      } else {
        setErrors({ submit: data.error || 'Erro ao gerar código' });
      }
    } catch (error) {
      console.error('Erro:', error);
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // PASSO 2: Verificar código
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!formData.code) {
      setErrors({ code: 'Código é obrigatório' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-reset-code', {
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

  // PASSO 3: Resetar senha
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
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          code: formData.code,
          newPassword: formData.newPassword
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
        {/* Header */}
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
            {step === 2 && 'Digite o código de 6 dígitos que foi gerado'}
            {step === 3 && 'Defina sua nova senha'}
          </p>
        </div>

        {/* Indicador de progresso */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {/* Mensagem de sucesso */}
        {successMessage && (
          <div className="success-banner">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mensagem de erro */}
        {errors.submit && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* PASSO 1: Email */}
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
              {isSubmitting ? 'Gerando código...' : 'Gerar Código'}
            </button>
          </form>
        )}

        {/* PASSO 2: Código */}
        {step === 2 && (
          <>
            {/* Mostrar o código gerado */}
            <div className="code-display">
              <p className="code-label">Seu código de recuperação:</p>
              <div className="code-box">
                <span className="code-value">{resetCode}</span>
                <button 
                  type="button" 
                  className="copy-button"
                  onClick={copyCode}
                  title="Copiar código"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="code-hint">⚠️ Este código expira em 15 minutos</p>
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
                onClick={() => setStep(1)}
              >
                Gerar novo código
              </button>
            </form>
          </>
        )}

        {/* PASSO 3: Nova Senha */}
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