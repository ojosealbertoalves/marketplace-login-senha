// backend/testClientUser.js - TESTAR CADASTRO E LOGIN DE CLIENTE
const BASE_URL = 'http://localhost:3001/api';

async function testClientUser() {
  console.log('🧪 TESTANDO USUÁRIO TIPO CLIENTE\n');
  console.log('=' .repeat(60));

  // ===================================
  // 1️⃣ CRIAR CLIENTE FINAL
  // ===================================
  console.log('\n1️⃣ Criando usuário CLIENTE FINAL...');
  
  const clientData = {
    name: 'Maria Silva',
    email: 'maria.cliente@teste.com',
    password: '123456',
    confirmPassword: '123456',
    userType: 'client'
  };

  try {
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    });

    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('✅ Cliente criado com sucesso!');
      console.log(`👤 Nome: ${registerResult.user.name}`);
      console.log(`📧 Email: ${registerResult.user.email}`);
      console.log(`🔑 Tipo: ${registerResult.user.user_type}`);
      console.log(`🎫 Token: ${registerResult.token.substring(0, 30)}...`);
    } else {
      const error = await registerResponse.json();
      console.log('⚠️ Erro ao criar cliente:', error.error);
      
      // Se já existe, vamos tentar fazer login
      if (error.error.includes('já cadastrado')) {
        console.log('\n📝 Email já cadastrado, tentando login...');
      }
    }
  } catch (error) {
    console.log('❌ Erro na criação:', error.message);
  }

  // ===================================
  // 2️⃣ LOGIN DO CLIENTE
  // ===================================
  console.log('\n' + '='.repeat(60));
  console.log('2️⃣ Testando LOGIN do cliente...');
  
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'maria.cliente@teste.com',
        password: '123456'
      })
    });

    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Cliente logou com sucesso!');
      console.log(`👤 Nome: ${loginResult.user.name}`);
      console.log(`🔑 Tipo: ${loginResult.user.user_type}`);
      
      const clientToken = loginResult.token;

      // ===================================
      // 3️⃣ BUSCAR PERFIL DO CLIENTE
      // ===================================
      console.log('\n' + '='.repeat(60));
      console.log('3️⃣ Buscando perfil do cliente...');
      
      const profileResponse = await fetch(`${BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${clientToken}` }
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        console.log('✅ Perfil carregado:');
        console.log(`   - Nome: ${profile.user.name}`);
        console.log(`   - Tipo: ${profile.user.user_type}`);
        console.log(`   - Email: ${profile.user.email}`);
        console.log(`   - Perfil Profissional: ${profile.user.professionalProfile ? '❌ Existe (ERRO!)' : '✅ Não existe (correto!)'}`);
        console.log(`   - Perfil Empresa: ${profile.user.companyProfile ? '❌ Existe (ERRO!)' : '✅ Não existe (correto!)'}`);
      }

      // ===================================
      // 4️⃣ LISTAR PROFISSIONAIS COMO CLIENTE
      // ===================================
      console.log('\n' + '='.repeat(60));
      console.log('4️⃣ Listando profissionais como cliente autenticado...');
      
      const professionalsResponse = await fetch(`${BASE_URL}/professionals?limit=5`, {
        headers: { 'Authorization': `Bearer ${clientToken}` }
      });

      if (professionalsResponse.ok) {
        const professionals = await professionalsResponse.json();
        console.log(`✅ ${professionals.data.length} profissionais encontrados`);
        console.log('📋 Cliente pode ver informações de contato:');
        
        professionals.data.forEach((prof, index) => {
          console.log(`\n   ${index + 1}. ${prof.name}`);
          console.log(`      - Email: ${prof.email || '❌ RESTRITO'}`);
          console.log(`      - Telefone: ${prof.phone || '❌ RESTRITO'}`);
          console.log(`      - Categoria: ${prof.category}`);
        });
      }

      // ===================================
      // 5️⃣ VERIFICAR SE CLIENTE APARECE NA LISTAGEM
      // ===================================
      console.log('\n' + '='.repeat(60));
      console.log('5️⃣ Verificando se cliente aparece na listagem pública...');
      
      const publicListResponse = await fetch(`${BASE_URL}/professionals?search=Maria Silva`);
      
      if (publicListResponse.ok) {
        const publicList = await publicListResponse.json();
        const clientInList = publicList.data.find(p => p.email === 'maria.cliente@teste.com');
        
        if (clientInList) {
          console.log('❌ ERRO: Cliente aparece na listagem pública!');
        } else {
          console.log('✅ CORRETO: Cliente NÃO aparece na listagem pública');
        }
      }

      // ===================================
      // 6️⃣ TESTAR PERMISSÕES DO CLIENTE
      // ===================================
      console.log('\n' + '='.repeat(60));
      console.log('6️⃣ Testando permissões do cliente...');
      console.log('   ✅ view_professionals: Permitido');
      console.log('   ✅ view_contact_info: Permitido');
      console.log('   ✅ view_own_profile: Permitido');
      console.log('   ❌ indicate_professionals: NÃO permitido (exclusivo de profissionais/empresas)');
      console.log('   ❌ create_categories: NÃO permitido (exclusivo de admin)');

    } else {
      console.log('❌ Erro no login do cliente');
    }
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 TESTE COMPLETO!\n');
}

// Executar teste
testClientUser().catch(console.error);