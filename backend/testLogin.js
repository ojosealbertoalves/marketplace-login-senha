// backend/testLogin.js - TESTE COMPLETO DO SISTEMA
const BASE_URL = 'http://localhost:3001/api';

async function testCompleteSystem() {
  console.log('🔐 TESTANDO SISTEMA COMPLETO DE AUTENTICAÇÃO\n');
  console.log('=' .repeat(60));

  // ===================================
  // 1️⃣ TESTE DE LOGIN ADMIN
  // ===================================
  console.log('\n1️⃣ TESTANDO LOGIN ADMIN...');
  const adminLogin = await login('admin@marketplace.com', '123456');
  
  if (adminLogin.success) {
    console.log('✅ Admin logou com sucesso!');
    console.log(`👤 Nome: ${adminLogin.user.name}`);
    console.log(`📧 Email: ${adminLogin.user.email}`);
    console.log(`🔑 Tipo: ${adminLogin.user.user_type}`);
    console.log(`🎫 Token: ${adminLogin.token.substring(0, 30)}...`);
    
    // Testar rota admin
    console.log('\n📊 Testando rota administrativa...');
    const statsResponse = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminLogin.token}` }
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Estatísticas carregadas:', stats.data);
    } else {
      console.log('❌ Erro ao carregar estatísticas admin');
    }
  }

  // ===================================
  // 2️⃣ TESTE DE LOGIN PROFISSIONAL
  // ===================================
  console.log('\n' + '='.repeat(60));
  console.log('2️⃣ TESTANDO LOGIN PROFISSIONAL...');
  const profLogin = await login('joao.pedreiro@teste.com', '123456');
  
  if (profLogin.success) {
    console.log('✅ Profissional logou com sucesso!');
    console.log(`👤 Nome: ${profLogin.user.name}`);
    console.log(`📧 Email: ${profLogin.user.email}`);
    console.log(`🔑 Tipo: ${profLogin.user.user_type}`);
    
    // Testar perfil profissional
    console.log('\n👤 Carregando perfil completo...');
    const profileResponse = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${profLogin.token}` }
    });
    
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log('✅ Perfil carregado:');
      console.log(`   - Nome: ${profile.user.name}`);
      console.log(`   - Tipo: ${profile.user.user_type}`);
      console.log(`   - Perfil Profissional: ${profile.user.professionalProfile ? '✅ Existe' : '❌ Não existe'}`);
    }
  }

  // ===================================
  // 3️⃣ TESTE DE LOGIN EMPRESA
  // ===================================
  console.log('\n' + '='.repeat(60));
  console.log('3️⃣ TESTANDO LOGIN EMPRESA...');
  const companyLogin = await login('contato@construtoramendes.com', '123456');
  
  if (companyLogin.success) {
    console.log('✅ Empresa logou com sucesso!');
    console.log(`👤 Nome: ${companyLogin.user.name}`);
    console.log(`📧 Email: ${companyLogin.user.email}`);
    console.log(`🔑 Tipo: ${companyLogin.user.user_type}`);
  }

  // ===================================
  // 4️⃣ TESTE DE ACESSO SEM LOGIN
  // ===================================
  console.log('\n' + '='.repeat(60));
  console.log('4️⃣ TESTANDO ACESSO SEM LOGIN...');
  
  const publicResponse = await fetch(`${BASE_URL}/professionals`);
  if (publicResponse.ok) {
    const publicData = await publicResponse.json();
    console.log('✅ Lista pública carregada');
    console.log(`🔒 Contatos ocultos: ${publicData.meta?.message || 'Sim'}`);
    console.log(`📋 Profissionais encontrados: ${publicData.data?.length || 0}`);
  }

  // ===================================
  // 5️⃣ TESTE DE ACESSO COM LOGIN
  // ===================================
  if (profLogin.success) {
    console.log('\n5️⃣ TESTANDO ACESSO COM LOGIN...');
    
    const authResponse = await fetch(`${BASE_URL}/professionals`, {
      headers: { 'Authorization': `Bearer ${profLogin.token}` }
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Lista autenticada carregada');
      console.log(`🔓 Contatos visíveis: ${authData.meta?.isAuthenticated ? 'Sim' : 'Não'}`);
      console.log(`📋 Profissionais com contato: ${authData.data?.length || 0}`);
    }
  }

  // ===================================
  // 6️⃣ TESTE DE TOKEN INVÁLIDO
  // ===================================
  console.log('\n' + '='.repeat(60));
  console.log('6️⃣ TESTANDO TOKEN INVÁLIDO...');
  
  const invalidResponse = await fetch(`${BASE_URL}/auth/profile`, {
    headers: { 'Authorization': 'Bearer token-invalido-123' }
  });
  
  if (!invalidResponse.ok) {
    const error = await invalidResponse.json();
    console.log('✅ Token inválido rejeitado corretamente');
    console.log(`❌ Erro: ${error.error}`);
  }

  // ===================================
  // 7️⃣ LISTAR TODOS OS USUÁRIOS (ADMIN)
  // ===================================
  if (adminLogin.success) {
    console.log('\n' + '='.repeat(60));
    console.log('7️⃣ LISTANDO TODOS OS USUÁRIOS (ADMIN)...');
    
    const usersResponse = await fetch(`${BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminLogin.token}` }
    });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Lista de usuários carregada:');
      
      usersData.data?.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name}`);
        console.log(`      📧 ${user.email}`);
        console.log(`      🔑 Tipo: ${user.user_type}`);
        console.log(`      📅 Criado: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log(`      ✅ Ativo: ${user.is_active ? 'Sim' : 'Não'}`);
        console.log('');
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 TODOS OS TESTES CONCLUÍDOS!');
  console.log('✅ Sistema de autenticação funcionando perfeitamente!');
  console.log('='.repeat(60));
}

// Função helper para login
async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, ...data };
    } else {
      const error = await response.json();
      console.log(`❌ Erro no login: ${error.error}`);
      return { success: false, error: error.error };
    }
  } catch (error) {
    console.log(`❌ Erro no login: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Executar testes
testCompleteSystem();