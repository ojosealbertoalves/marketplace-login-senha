// frontend/src/pages/ComoFunciona.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Phone, Shield, CheckCircle, Star } from 'lucide-react';
import './ComoFunciona.css';

const ComoFunciona = () => {
  return (
    <div className="como-funciona-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1>Como Funciona o ConstruGO</h1>
          <p className="hero-subtitle">
            Conectamos profissionais da construção civil com clientes em todo o estado de Goiás
          </p>
        </div>
      </section>

      {/* Para Clientes */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>👤 Para Clientes</h2>
            <p>Encontre o profissional ideal para seu projeto em 3 passos simples</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Search size={40} />
              </div>
              <h3>Busque Profissionais</h3>
              <p>
                Use nossos filtros para encontrar profissionais por categoria, 
                especialidade, cidade e região. Veja portfolios, avaliações e 
                informações de contato.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Phone size={40} />
              </div>
              <h3>Entre em Contato</h3>
              <p>
                Após fazer login, você terá acesso aos contatos dos profissionais. 
                Ligue, mande WhatsApp ou visite o local de trabalho para discutir 
                seu projeto.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <CheckCircle size={40} />
              </div>
              <h3>Realize seu Projeto</h3>
              <p>
                Negocie diretamente com o profissional, sem intermediários. 
                Você tem total autonomia para fechar o melhor negócio para 
                seu projeto.
              </p>
            </div>
          </div>

          <div className="cta-box">
            <h3>Pronto para começar?</h3>
            <Link to="/cadastro" className="btn btn-primary">
              <UserPlus size={20} />
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      </section>

      {/* Para Profissionais */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>🏗️ Para Profissionais</h2>
            <p>Divulgue seu trabalho e conquiste mais clientes</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <UserPlus size={40} />
              </div>
              <h3>Crie seu Perfil</h3>
              <p>
                Cadastre-se gratuitamente, preencha suas informações profissionais, 
                especialidades, região de atuação e adicione fotos dos seus trabalhos.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Star size={40} />
              </div>
              <h3>Destaque-se</h3>
              <p>
                Mantenha seu perfil atualizado com portfolio, certificações e 
                informações de contato. Quanto mais completo, mais chances de 
                ser encontrado.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Phone size={40} />
              </div>
              <h3>Receba Contatos</h3>
              <p>
                Clientes interessados entrarão em contato diretamente com você. 
                Sem intermediários, sem taxas por serviço realizado.
              </p>
            </div>
          </div>

          <div className="cta-box">
            <h3>Seja encontrado por milhares de clientes</h3>
            <Link to="/cadastro" className="btn btn-primary">
              <UserPlus size={20} />
              Cadastrar como Profissional
            </Link>
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Por que usar o ConstruGO?</h2>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <Shield size={48} />
              <h3>100% Gratuito</h3>
              <p>Sem taxas, sem mensalidades. Totalmente gratuito para profissionais e clientes.</p>
            </div>

            <div className="benefit-card">
              <Search size={48} />
              <h3>Fácil de Usar</h3>
              <p>Interface simples e intuitiva. Encontre ou seja encontrado em poucos cliques.</p>
            </div>

            <div className="benefit-card">
              <CheckCircle size={48} />
              <h3>Sem Intermediários</h3>
              <p>Contato direto entre profissional e cliente. Você negocia do seu jeito.</p>
            </div>

            <div className="benefit-card">
              <Star size={48} />
              <h3>Profissionais Qualificados</h3>
              <p>Veja portfolio, experiência e especialidades antes de contratar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Perguntas Frequentes</h2>
          </div>

          <div className="faq-list">
            <div className="faq-item">
              <h3>O ConstruGO cobra alguma taxa?</h3>
              <p>
                Não! O ConstruGO é 100% gratuito tanto para profissionais quanto para clientes. 
                Não cobramos taxa de cadastro, mensalidade ou comissão por serviços realizados.
              </p>
            </div>

            <div className="faq-item">
              <h3>Como faço para ver os contatos dos profissionais?</h3>
              <p>
                Você precisa criar uma conta gratuita e fazer login. Após autenticado, 
                os contatos (telefone, WhatsApp, redes sociais) dos profissionais ficam visíveis.
              </p>
            </div>

            <div className="faq-item">
              <h3>O ConstruGO faz a intermediação dos serviços?</h3>
              <p>
                Não. Somos apenas um catálogo que conecta profissionais e clientes. 
                A negociação, contratação e pagamento são feitos diretamente entre as partes.
              </p>
            </div>

            <div className="faq-item">
              <h3>Como faço para aparecer nas buscas?</h3>
              <p>
                Cadastre-se como Profissional ou Empresa, preencha seu perfil completamente, 
                adicione fotos do seu trabalho e mantenha suas informações atualizadas. 
                Perfis completos têm mais visibilidade.
              </p>
            </div>

            <div className="faq-item">
              <h3>Posso confiar nos profissionais cadastrados?</h3>
              <p>
                Recomendamos sempre verificar referências, pedir orçamentos detalhados e, 
                se possível, visitar obras já realizadas. O ConstruGO disponibiliza as 
                informações, mas a escolha final é sempre sua.
              </p>
            </div>

            <div className="faq-item">
              <h3>Meus dados estão seguros?</h3>
              <p>
                Sim. Seguimos as diretrizes da LGPD (Lei Geral de Proteção de Dados). 
                Seus dados pessoais são armazenados com segurança e nunca são compartilhados 
                com terceiros sem sua autorização. Veja nossa{' '}
                <Link to="/privacidade">Política de Privacidade</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section cta-final">
        <div className="container">
          <h2>Pronto para começar?</h2>
          <p>Junte-se aos milhares de profissionais e clientes que já usam o ConstruGO</p>
          <div className="cta-buttons">
            <Link to="/cadastro" className="btn btn-primary btn-large">
              <UserPlus size={20} />
              Criar Conta Grátis
            </Link>
            <Link to="/" className="btn btn-secondary btn-large">
              <Search size={20} />
              Buscar Profissionais
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComoFunciona;