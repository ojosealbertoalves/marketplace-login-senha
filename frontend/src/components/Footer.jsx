// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Seção principal */}
        <div className="footer-main">
          {/* Sobre a empresa */}
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🏗️</span>
              <span className="logo-text">CatálogoPro</span>
            </div>
            <p className="footer-description">
              A maior plataforma de profissionais da construção civil do Brasil. 
              Conectando clientes e profissionais especializados com qualidade e confiança.
            </p>
            <div className="footer-social">
              <a href="#" className="social-icon" aria-label="Facebook">
                📘
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                📷
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                💼
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                📺
              </a>
            </div>
          </div>

          {/* Links rápidos */}
          <div className="footer-section">
            <h3 className="footer-title">Links Rápidos</h3>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  Buscar Profissionais
                </Link>
              </li>
              <li>
                <Link to="/como-funciona" className="footer-link">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="footer-link">
                  Cadastrar-se
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-link">
                  Fazer Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Categorias populares */}
          <div className="footer-section">
            <h3 className="footer-title">Categorias Populares</h3>
            <ul className="footer-links">
              <li>
                <Link to="/?category=1" className="footer-link">
                  Obras e Reformas
                </Link>
              </li>
              <li>
                <Link to="/?category=2" className="footer-link">
                  Arquitetura e Design
                </Link>
              </li>
              <li>
                <Link to="/?category=3" className="footer-link">
                  Elétrica
                </Link>
              </li>
              <li>
                <Link to="/?category=4" className="footer-link">
                  Hidráulica
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="footer-section">
            <h3 className="footer-title">Contato</h3>
            <div className="footer-contact">
              <div className="contact-item">
                <Mail size={16} />
                <span>contato@catalogopro.com.br</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>(11) 99999-9999</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="footer-divider"></div>

        {/* Rodapé inferior */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; {currentYear} CatálogoPro. Todos os direitos reservados.</p>
          </div>
          <div className="footer-bottom-right">
            <Link to="/termos" className="footer-legal-link">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="footer-legal-link">
              Política de Privacidade
            </Link>
            <Link to="/suporte" className="footer-legal-link">
              Suporte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;