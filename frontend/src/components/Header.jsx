// frontend/src/components/Header.jsx - COM AUTENTICAÇÃO
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
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
            
            {/* Botões de autenticação */}
            {isAuthenticated ? (
              <div className="auth-menu">
                <div className="user-info">
                  <User size={18} />
                  <span>Olá, {user?.name?.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="nav-link logout-button">
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="nav-link login-link">
                  <LogIn size={18} />
                  Entrar
                </Link>
                <Link to="/cadastro" className="nav-link register-link">
                  <UserPlus size={18} />
                  Cadastrar
                </Link>
              </div>
            )}
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
            
            {/* Menu mobile - autenticação */}
            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <User size={18} />
                  <span>Olá, {user?.name?.split(' ')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="mobile-nav-link logout-mobile"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn size={18} />
                  Entrar
                </Link>
                <Link 
                  to="/cadastro" 
                  className="mobile-nav-link register-mobile"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserPlus size={18} />
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;