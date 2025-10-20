// frontend/src/App.jsx - VERSÃO FINAL COM REGISTRO
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProfessionalProfile from './pages/ProfessionalProfile';
import ProfessionalSignup from './pages/ProfessionalSignup';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
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
          <Route path="/como-funciona" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

