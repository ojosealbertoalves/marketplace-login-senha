// frontend/src/pages/ComoFunciona.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, MessageCircle, CheckCircle } from 'lucide-react';
import './ComoFunciona.css';

const ComoFunciona = () => {
  const steps = [
    {
      icon: <Search size={48} />,
      title: 'Busque Profissionais',
      description: 'Pesquise por categoria, localização ou nome do profissional. Utilize nossos filtros para encontrar exatamente o que precisa.'
    },
    {
      icon: <UserPlus size={48} />,
      title: 'Visualize Perfis',
      description: 'Veja informações detalhadas sobre cada profissional: experiência, especialidades, avaliações e contato.'
    },
    {
      icon: <MessageCircle size={48} />,
      title: 'Entre em Contato',
      description: 'Conecte-se diretamente com o profissional através do WhatsApp ou telefone para solicitar orçamentos.'
    },
    {
      icon: <CheckCircle size={48} />,
      title: 'Contrate com Confiança',
      description: 'Escolha o profissional ideal para seu projeto com base nas avaliações e informações disponíveis.'
    }
  ];

  return (
    <div className="como-funciona-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="page-title">Como Funciona o ConstruGO</h1>
          <p className="page-subtitle">
            Conectar você ao profissional ideal nunca foi tão fácil e rápido
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        <div className="container">
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Profissionais */}
      <section className="profissionais-section">
        <div className="container">
          <h2 className="section-title">Para Profissionais</h2>
          <div className="profissionais-content">
            <div className="profissionais-text">
              <h3>Cadastre-se Gratuitamente</h3>
              <p>
                Se você é um profissional da construção civil, cadastre-se em nossa plataforma 
                e aumente sua visibilidade no mercado de Goiás.
              </p>
              <ul className="benefits-list">
                <li>✓ Cadastro 100% gratuito</li>
                <li>✓ Perfil profissional completo</li>
                <li>✓ Receba contatos de clientes interessados</li>
                <li>✓ Gerencie suas informações facilmente</li>
              </ul>
              <Link to="/cadastro" className="cta-button">
                Cadastrar Agora
              </Link>
            </div>
            <div className="profissionais-image">
              🏗️
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title">Perguntas Frequentes</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>O cadastro é gratuito?</h3>
              <p>Sim! Tanto para profissionais quanto para clientes, o cadastro e uso da plataforma são 100% gratuitos.</p>
            </div>
            <div className="faq-item">
              <h3>Como entro em contato com um profissional?</h3>
              <p>Após visualizar o perfil do profissional, você pode entrar em contato diretamente pelo WhatsApp ou telefone informado.</p>
            </div>
            <div className="faq-item">
              <h3>Os profissionais são verificados?</h3>
              <p>Realizamos verificação básica dos cadastros. Recomendamos sempre verificar avaliações e solicitar referências.</p>
            </div>
            <div className="faq-item">
              <h3>Como posso avaliar um profissional?</h3>
              <p>Após contratar um serviço, você pode deixar sua avaliação no perfil do profissional, ajudando outros usuários.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-section">
        <div className="container">
          <h2>Pronto para Começar?</h2>
          <p>Encontre o profissional ideal para seu projeto agora mesmo</p>
          <div className="cta-buttons">
            <Link to="/" className="cta-button primary">
              Buscar Profissionais
            </Link>
            <Link to="/cadastro" className="cta-button secondary">
              Cadastrar-se
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComoFunciona;