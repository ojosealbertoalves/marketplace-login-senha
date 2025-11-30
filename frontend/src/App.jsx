// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProfessionalProfile from './pages/ProfessionalProfile';
import ProfessionalSignup from './pages/ProfessionalSignup';
import ComoFunciona from './pages/ComoFunciona';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import LGPD from './pages/LGPD';
import Termos from './pages/Termos';
import Privacidade from './pages/Privacidade';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profissional/:id" element={<ProfessionalProfile />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/cadastro-profissional" element={<ProfessionalSignup />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/lgpd" element={<LGPD />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;