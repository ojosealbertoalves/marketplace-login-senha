// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProfessionalProfile from './pages/ProfessionalProfile';
import ProfessionalSignup from './pages/ProfessionalSignup';
import HowItWorks from './pages/HowItWorks';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profissional/:id" element={<ProfessionalProfile />} />
            <Route path="/professional/:id" element={<ProfessionalProfile />} />
            <Route path="/cadastro-profissional" element={<ProfessionalSignup />} />
            <Route path="/como-funciona" element={<HowItWorks />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;