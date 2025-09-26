// testAuth.js
const BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Iniciando testes da API...\n');

  try {
    // 1. Teste básico
    console.log('1️⃣ Testando API básica...');
    const testResponse = await fetch(`${BASE_URL}/test`);
    const testData = await testResponse.json();
    console.log('✅ API funcionando:', testData.message);
    
    // 2. Teste registro admin
    console.log('\n2️⃣ Testando registro de admin...');
    const adminData = {
      name: 'Admin Teste',
      email: 'admin@teste.com',
      password: '123456',
      confirmPassword: '123456',
      userType: 'admin'
    };

    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Admin registrado:', registerData.user.name);
    } else {
      const error = await registerResponse.json();
      console.log('⚠️ Registro admin:', error.error || 'Erro desconhecido');
    }

    // 3. Teste login admin
    console.log('\n3️⃣ Testando login admin...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@teste.com',
        password: '123456'
      })
    });

    let adminToken = null;
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      adminToken = loginData.token;
      console.log('✅ Login admin realizado');
      console.log('👤 Usuário:', loginData.user.name);
      console.log('🔑 Tipo:', loginData.user.user_type);
    } else {
      const error = await loginResponse.json();
      console.log('❌ Erro no login admin:', error.error);
      return;
    }

    // 4. Teste perfil admin
    console.log('\n4️⃣ Testando perfil admin...');
    const profileResponse = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Perfil carregado:', profileData.user.name);
    } else {
      console.log('❌ Erro ao carregar perfil');
    }

    // 5. Teste rota admin
    console.log('\n5️⃣ Testando rota administrativa...');
    const statsResponse = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Estatísticas admin:', statsData.data);
    } else {
      const error = await statsResponse.json();
      console.log('❌ Erro em rota admin:', error.error);
    }

    console.log('\n🎉 Testes de autenticação concluídos!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

// Executar testes
testAPI();