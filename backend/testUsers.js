// backend/testUsers.js
const BASE_URL = 'http://localhost:3001/api';

async function createTestUsers() {
  console.log('👥 Criando usuários de teste...\n');

  // 1️⃣ CRIAR ADMIN
  console.log('1️⃣ Criando usuário ADMIN...');
  try {
    const adminData = {
      name: 'Administrador Sistema',
      email: 'admin@marketplace.com',
      password: '123456',
      confirmPassword: '123456',
      userType: 'admin',
      phone: '(11) 99999-9999'
    };

    const adminResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });

    if (adminResponse.ok) {
      const adminResult = await adminResponse.json();
      console.log('✅ Admin criado:', adminResult.user.name);
      console.log('📧 Email:', adminResult.user.email);
      console.log('🔑 Token:', adminResult.token.substring(0, 50) + '...');
    } else {
      const error = await adminResponse.json();
      console.log('⚠️ Admin:', error.error);
    }
  } catch (error) {
    console.log('❌ Erro ao criar admin:', error.message);
  }

  // 2️⃣ CRIAR PROFISSIONAL 1
  console.log('\n2️⃣ Criando profissional PEDREIRO...');
  try {
    const profData1 = {
      name: 'João Silva',
      email: 'joao.pedreiro@teste.com',
      password: '123456',
      confirmPassword: '123456',
      userType: 'professional',
      phone: '(11) 98888-7777',
      city: 'São Paulo',
      state: 'SP',
      category_id: 'cat-obras-reformas',
      subcategories: ['subcat-pedreiro'],
      description: 'Pedreiro com 15 anos de experiência em construção civil. Especializado em alvenaria, reboco e acabamentos.',
      experience: '15 anos de experiência em obras residenciais e comerciais',
      education: 'Curso técnico em construção civil'
    };

    const prof1Response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profData1)
    });

    if (prof1Response.ok) {
      const prof1Result = await prof1Response.json();
      console.log('✅ Profissional criado:', prof1Result.user.name);
      console.log('📧 Email:', prof1Result.user.email);
    } else {
      const error = await prof1Response.json();
      console.log('⚠️ Profissional 1:', error.error);
    }
  } catch (error) {
    console.log('❌ Erro ao criar profissional 1:', error.message);
  }

  // 3️⃣ CRIAR PROFISSIONAL 2  
  console.log('\n3️⃣ Criando profissional ELETRICISTA...');
  try {
    const profData2 = {
      name: 'Maria Santos',
      email: 'maria.eletricista@teste.com',
      password: '123456',
      confirmPassword: '123456',
      userType: 'professional',
      phone: '(11) 97777-6666',
      city: 'São Paulo',
      state: 'SP',
      category_id: 'cat-eletrica-hidraulica',
      subcategories: ['subcat-eletricista'],
      description: 'Eletricista especializada em instalações residenciais e comerciais. NR-10 atualizada.',
      experience: '8 anos de experiência em instalações elétricas',
      education: 'Técnica em eletrotécnica + NR-10'
    };

    const prof2Response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profData2)
    });

    if (prof2Response.ok) {
      const prof2Result = await prof2Response.json();
      console.log('✅ Profissional criado:', prof2Result.user.name);
      console.log('📧 Email:', prof2Result.user.email);
    } else {
      const error = await prof2Response.json();
      console.log('⚠️ Profissional 2:', error.error);
    }
  } catch (error) {
    console.log('❌ Erro ao criar profissional 2:', error.message);
  }

  // 4️⃣ CRIAR EMPRESA
  console.log('\n4️⃣ Criando usuário EMPRESA...');
  try {
    const companyData = {
      name: 'Carlos Mendes',
      email: 'contato@construtoramendes.com',
      password: '123456',
      confirmPassword: '123456',
      userType: 'company',
      phone: '(11) 96666-5555',
      city: 'São Paulo',
      state: 'SP',
      companyName: 'Construtora Mendes Ltda',
      cnpj: '12.345.678/0001-90',
      website: 'www.construtoramendes.com',
      businessAreas: ['construção', 'reformas', 'acabamentos']
    };

    const companyResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyData)
    });

    if (companyResponse.ok) {
      const companyResult = await companyResponse.json();
      console.log('✅ Empresa criada:', companyResult.user.name);
      console.log('📧 Email:', companyResult.user.email);
    } else {
      const error = await companyResponse.json();
      console.log('⚠️ Empresa:', error.error);
    }
  } catch (error) {
    console.log('❌ Erro ao criar empresa:', error.message);
  }

  // 5️⃣ TESTAR LOGIN DOS USUÁRIOS
  console.log('\n5️⃣ Testando login dos usuários...');
  
  const testUsers = [
    { email: 'admin@marketplace.com', password: '123456', type: 'Admin' },
    { email: 'joao.pedreiro@teste.com', password: '123456', type: 'Pedreiro' },
    { email: 'maria.eletricista@teste.com', password: '123456', type: 'Eletricista' },
    { email: 'contato@construtoramendes.com', password: '123456', type: 'Empresa' }
  ];

  for (const user of testUsers) {
    try {
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password })
      });

      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log(`✅ ${user.type} logou com sucesso: ${loginResult.user.name}`);
      } else {
        console.log(`❌ Erro no login ${user.type}`);
      }
    } catch (error) {
      console.log(`❌ Erro no login ${user.type}:`, error.message);
    }
  }

  console.log('\n🎉 Usuários de teste criados com sucesso!');
  console.log('\n📋 CREDENCIAIS PARA USAR:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 ADMIN:');
  console.log('   Email: admin@marketplace.com');
  console.log('   Senha: 123456');
  console.log('');
  console.log('👷 PEDREIRO:');
  console.log('   Email: joao.pedreiro@teste.com');
  console.log('   Senha: 123456');
  console.log('');
  console.log('⚡ ELETRICISTA:'); 
  console.log('   Email: maria.eletricista@teste.com');
  console.log('   Senha: 123456');
  console.log('');
  console.log('🏢 EMPRESA:');
  console.log('   Email: contato@construtoramendes.com');
  console.log('   Senha: 123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

createTestUsers();