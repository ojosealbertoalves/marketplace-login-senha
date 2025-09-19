// frontend/src/components/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Menu, X } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-icon">🏗️</span>
            <span className="logo-text">CatálogoPro</span>
          </Link>

          {/* Menu Desktop */}
          <nav className="desktop-nav">
            <Link to="/" className="nav-link">
              <Search size={18} />
              Buscar Profissionais
            </Link>
            <Link to="/como-funciona" className="nav-link">
              Como Funciona
            </Link>
            <Link to="/cadastro-profissional" className="nav-link professional-signup">
              <User size={18} />
              Sou Profissional
            </Link>
          </nav>

          {/* Botão Mobile Menu */}
          <button 
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="mobile-nav">
            <Link 
              to="/" 
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Search size={18} />
              Buscar Profissionais
            </Link>
            <Link 
              to="/como-funciona" 
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Como Funciona
            </Link>
            <Link 
              to="/cadastro-profissional" 
              className="mobile-nav-link professional-signup"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={18} />
              Sou Profissional
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;