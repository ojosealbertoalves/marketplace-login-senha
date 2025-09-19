// frontend/src/pages/ProfessionalSignup.jsx
import React from 'react';
import { ExternalLink, Check, Clock, DollarSign, Users, Star } from 'lucide-react';
import './ProfessionalSignup.css';

const ProfessionalSignup = () => {
  // SUBSTITUA PELA SUA URL DO GOOGLE FORMS
  const GOOGLE_FORMS_URL = "https://forms.google.com/sua-url-do-forms";

  const benefits = [
    {
      icon: <Users size={24} />,
      title: "Mais Clientes",
      description: "Apareça para milhares de pessoas procurando seus serviços"
    },
    {
      icon: <Star size={24} />,
      title: "Credibilidade",
      description: "Mostre seu trabalho e experiência de forma profissional"
    },
    {
      icon: <Clock size={24} />,
      title: "Disponibilidade 24h",
      description: "Seu perfil trabalha por você mesmo quando você está ocupado"
    }
  ];

  const handleFormClick = () => {
    window.open(GOOGLE_FORMS_URL, '_blank');
  };

  return (
    <div className="professional-signup">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Faça Parte do Maior Catálogo de Profissionais da Construção</h1>
            <p className="hero-subtitle">
              Conecte-se com clientes que precisam dos seus serviços. 
              Simples, rápido e eficiente.
            </p>
            <button 
              className="cta-button primary"
              onClick={handleFormClick}
            >
              <ExternalLink size={20} />
              Quero me Cadastrar
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2>Por que se cadastrar?</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">
                  {benefit.icon}
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="plans-section">
        <div className="container">
          <h2>Nossos Planos</h2>
          <div className="plans-grid">
            <div className="plan-card">
              <div className="plan-header">
                <h3>Plano Mensal</h3>
                <div className="price">
                  <span className="amount">R$ 6,99</span>
                  <span className="period">/mês</span>
                </div>
              </div>
              <ul className="features-list">
                <li><Check size={16} />Perfil completo no catálogo</li>
                <li><Check size={16} />Portfolio com até 10 fotos</li>
                <li><Check size={16} />Informações de contato visíveis</li>
                <li><Check size={16} />Cancelamento a qualquer momento</li>
              </ul>
            </div>

            <div className="plan-card popular">
              <div className="popular-badge">Mais Popular</div>
              <div className="plan-header">
                <h3>Plano Anual</h3>
                <div className="price-container">
                  <span className="original-price">R$ 83,88</span>
                  <div className="price">
                    <span className="amount">R$ 60,00</span>
                    <span className="period">/ano</span>
                  </div>
                  <span className="savings">Economia de 28%</span>
                </div>
              </div>
              <ul className="features-list">
                <li><Check size={16} />Perfil completo no catálogo</li>
                <li><Check size={16} />Portfolio com até 10 fotos</li>
                <li><Check size={16} />Informações de contato visíveis</li>
                <li><Check size={16} />2 meses grátis</li>
                <li><Check size={16} />Suporte prioritário</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Pronto para Começar?</h2>
            <p>Cadastre-se agora e comece a receber novos clientes ainda hoje!</p>
            <button 
              className="cta-button primary large"
              onClick={handleFormClick}
            >
              <ExternalLink size={24} />
              Preencher Formulário de Cadastro
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfessionalSignup;