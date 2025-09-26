// frontend/src/pages/HowItWorks.jsx
import React from 'react';
import { Search, Phone, Star, Shield, Clock, Users } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  const customerSteps = [
    {
      icon: <Search size={32} />,
      title: "Busque por Profissionais",
      description: "Use nossos filtros para encontrar o profissional ideal por categoria, localização e especialidade."
    },
    {
      icon: <Star size={32} />,
      title: "Veja Portfólios e Avaliações",
      description: "Analise trabalhos anteriores, experiência e formação de cada profissional."
    },
    {
      icon: <Phone size={32} />,
      title: "Entre em Contato Direto",
      description: "Converse diretamente com o profissional via WhatsApp ou telefone para negociar o serviço."
    }
  ];

  const professionalSteps = [
    {
      number: "1",
      title: "Cadastre-se Gratuitamente",
      description: "Preencha nosso formulário com suas informações profissionais, experiência e portfolio."
    },
    {
      number: "2", 
      title: "Escolha seu Plano",
      description: "Selecione entre o plano mensal (R$ 6,99) ou anual (R$ 60,00) com 28% de desconto."
    },
    {
      number: "3",
      title: "Comece a Receber Clientes",
      description: "Seu perfil fica visível 24 horas por dia para milhares de clientes em busca de serviços."
    }
  ];

  const features = [
    {
      icon: <Shield size={24} />,
      title: "Segurança e Confiabilidade",
      description: "Todos os profissionais passam por verificação de dados antes de serem aprovados."
    },
    {
      icon: <Clock size={24} />,
      title: "Disponível 24/7",
      description: "Busque profissionais ou receba contatos a qualquer hora do dia ou da noite."
    },
    {
      icon: <Users size={24} />,
      title: "Rede Qualificada",
      description: "Conectamos apenas profissionais experientes e qualificados da construção civil."
    }
  ];

  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1>Como Funciona o CatálogoPro</h1>
          <p>Conectamos clientes e profissionais da construção civil de forma simples e eficiente</p>
        </div>
      </section>

      {/* Para Clientes */}
      <section className="customer-section">
        <div className="container">
          <h2>Para Clientes</h2>
          <p className="section-subtitle">Encontre o profissional ideal em 3 passos simples</p>
          
          <div className="steps-grid">
            {customerSteps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-icon">
                  {step.icon}
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Profissionais */}
      <section className="professional-section">
        <div className="container">
          <h2>Para Profissionais</h2>
          <p className="section-subtitle">Aumente sua clientela e faça seu negócio crescer</p>
          
          <div className="professional-steps">
            {professionalSteps.map((step, index) => (
              <div key={index} className="professional-step">
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2>Por que Escolher o CatálogoPro?</h2>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="container">
          <h2>Perguntas Frequentes</h2>
          
          <div className="faq-list">
            <div className="faq-item">
              <h3>É gratuito para clientes?</h3>
              <p>Sim! Clientes podem buscar e entrar em contato com profissionais sem nenhum custo.</p>
            </div>
            
            <div className="faq-item">
              <h3>Como os profissionais são verificados?</h3>
              <p>Verificamos dados pessoais, experiência profissional e exemplos de trabalhos antes da aprovação.</p>
            </div>
            
            <div className="faq-item">
              <h3>O pagamento é feito pela plataforma?</h3>
              <p>Não. O contato e negociação são diretos entre cliente e profissional. Não intermediamos pagamentos.</p>
            </div>
            
            <div className="faq-item">
              <h3>Posso alterar meu plano depois?</h3>
              <p>Sim! Profissionais podem migrar entre planos ou cancelar a qualquer momento.</p>
            </div>
            
            <div className="faq-item">
              <h3>Como funciona o cancelamento?</h3>
              <p>O cancelamento pode ser solicitado a qualquer momento e terá efeito no próximo ciclo de cobrança.</p>
            </div>
            
            <div className="faq-item">
              <h3>Qual a diferença entre os planos?</h3>
              <p>Ambos oferecem as mesmas funcionalidades. O plano anual oferece 28% de desconto comparado ao mensal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Pronto para Começar?</h2>
            <div className="cta-buttons">
              <a href="/" className="btn btn-primary">Buscar Profissionais</a>
              <a href="/cadastro-profissional" className="btn btn-secondary">Sou Profissional</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;