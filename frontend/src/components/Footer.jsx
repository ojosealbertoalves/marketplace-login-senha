// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Coluna 1: Sobre */}
          <div className="footer-column">
            <h3>Sobre</h3>
            <ul>
              <li><Link to="/como-funciona">Como Funciona</Link></li>
              <li><Link to="/cadastro-profissional">Seja um Profissional</Link></li>
              <li><Link to="/cadastro">Cadastre-se</Link></li>
            </ul>
          </div>

          {/* Coluna 2: Para Profissionais */}
          <div className="footer-column">
            <h3>Para Profissionais</h3>
            <ul>
              <li><Link to="/login">Área do Profissional</Link></li>
              <li><Link to="/perfil">Meu Perfil</Link></li>
              <li><Link to="/cadastro-profissional">Cadastrar Empresa</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Suporte */}
          <div className="footer-column">
            <h3>Suporte</h3>
            <ul>
              <li><a href="mailto:orcamentochat@gmail.com">Contato</a></li>
              <li><Link to="/como-funciona">Dúvidas Frequentes</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Legal */}
          <div className="footer-column">
            <h3>Legal</h3>
            <ul>
              <li><Link to="/termos">Termos de Uso</Link></li>
              <li><Link to="/privacidade">Política de Privacidade</Link></li>
              <li><Link to="/lgpd">LGPD</Link></li>
            </ul>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ConstruGO - Marketplace Construção Civil. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;