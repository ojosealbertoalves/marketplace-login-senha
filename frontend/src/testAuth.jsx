// frontend/src/TestAuth.jsx - TESTE ISOLADO DO AUTHCONTEXT
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componente que usa o useAuth
const AuthTester = () => {
  const auth = useAuth();
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Teste do AuthContext</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Estado Atual:</h2>
        <ul>
          <li><strong>Loading:</strong> {auth.loading ? 'Sim' : 'Não'}</li>
          <li><strong>Autenticado:</strong> {auth.isAuthenticated ? 'Sim' : 'Não'}</li>
          <li><strong>Token:</strong> {auth.token ? 'Existe' : 'Não existe'}</li>
          <li><strong>Usuário:</strong> {auth.user ? auth.user.name : 'Nenhum'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Métodos Disponíveis:</h2>
        <ul>
          <li>login: {typeof auth.login}</li>
          <li>register: {typeof auth.register}</li>
          <li>logout: {typeof auth.logout}</li>
          <li>updateProfile: {typeof auth.updateProfile}</li>
        </ul>
      </div>

      <div>
        <h2>Teste de Login:</h2>
        <button 
          onClick={async () => {
            console.log('Testando login...');
            const result = await auth.login('admin@marketplace.com', '123456');
            console.log('Resultado do login:', result);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Testar Login (admin@marketplace.com)
        </button>
        
        <button 
          onClick={() => {
            console.log('Fazendo logout...');
            auth.logout();
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginTop: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
        <h3>Debug JSON:</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify({
            loading: auth.loading,
            isAuthenticated: auth.isAuthenticated,
            user: auth.user,
            token: auth.token ? 'EXISTS' : null
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Componente principal com Provider
const TestAuth = () => {
  return (
    <AuthProvider>
      <AuthTester />
    </AuthProvider>
  );
};

export default TestAuth;