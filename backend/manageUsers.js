// backend/manageUsers.js - GERENCIAR USUÁRIOS
const BASE_URL = 'http://localhost:3001/api';

// Primeiro fazer login como admin
async function getAdminToken() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@marketplace.com',
      password: '123456'
    })
  });

  if (response.ok) {
    const data = await response.json();
    return data.token;
  }
  throw new Error('Não foi possível fazer login como admin');
}

async function listAllUsers() {
  console.log('👥 LISTANDO TODOS OS USUÁRIOS...\n');
  
  try {
    const token = await getAdminToken();
    
    const response = await fetch(`${BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      
      console.log(`📊 Total de usuários: ${data.pagination.total}`);
      console.log('─'.repeat(80));
      
      data.data.forEach((user, index) => {
        console.log(`${index + 1}. 👤 ${user.name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Tipo: ${user.user_type.toUpperCase()}`);
        console.log(`   📱 Telefone: ${user.phone || 'Não informado'}`);
        console.log(`   🏙️  Cidade: ${user.city || 'Não informada'}`);
        console.log(`   📅 Criado: ${new Date(user.created_at).toLocaleDateString('pt-BR')}`);
        console.log(`   ✅ Status: ${user.is_active ? '🟢 Ativo' : '🔴 Inativo'}`);
        console.log(`   🆔 ID: ${user.id}`);
        
        // Mostrar perfil específico se existir
        if (user.professionalProfile) {
          console.log(`   👷 Perfil: ${user.professionalProfile.category?.name || 'Profissional'}`);
        }
        if (user.companyProfile) {
          console.log(`   🏢 Empresa: ${user.companyProfile.company_name}`);
        }
        
        console.log('─'.repeat(80));
      });
    }
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error.message);
  }
}

async function deleteUser(userId) {
  console.log(`🗑️ EXCLUINDO USUÁRIO: ${userId}...\n`);
  
  try {
    const token = await getAdminToken();
    
    const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Usuário excluído com sucesso!');
      console.log(data.message);
    } else {
      const error = await response.json();
      console.log('❌ Erro ao excluir usuário:', error.error);
    }
  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error.message);
  }
}

async function toggleUserStatus(userId) {
  console.log(`🔄 ALTERANDO STATUS DO USUÁRIO: ${userId}...\n`);
  
  try {
    const token = await getAdminToken();
    
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/toggle-status`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Status alterado com sucesso!');
      console.log(data.message);
      console.log(`🆔 ID: ${data.data.id}`);
      console.log(`✅ Novo status: ${data.data.is_active ? '🟢 Ativo' : '🔴 Inativo'}`);
    } else {
      const error = await response.json();
      console.log('❌ Erro ao alterar status:', error.error);
    }
  } catch (error) {
    console.error('❌ Erro ao alterar status:', error.message);
  }
}

async function getSystemStats() {
  console.log('📊 ESTATÍSTICAS DO SISTEMA...\n');
  
  try {
    const token = await getAdminToken();
    
    const response = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      
      console.log('📈 Estatísticas Gerais:');
      console.log(`   👥 Total de usuários: ${data.data.totalUsers}`);
      console.log(`   👷 Profissionais: ${data.data.totalProfessionals}`);
      console.log(`   🏢 Empresas: ${data.data.totalCompanies}`);
      console.log(`   📂 Categorias: ${data.data.totalCategories}`);
      console.log(`   🏙️  Cidades: ${data.data.totalCities}`);
      console.log(`   🆕 Usuários recentes (30 dias): ${data.data.recentUsers}`);
    }
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error.message);
  }
}

async function showSecurityInfo() {
  console.log('🔐 INFORMAÇÕES DE SEGURANÇA...\n');
  console.log('✅ Segurança das Senhas:');
  console.log('   - Senhas são criptografadas com bcrypt (salt rounds: 12)');
  console.log('   - Hash irreversível - não é possível "descriptografar"');
  console.log('   - Mesmo admins não conseguem ver a senha original');
  console.log('   - Comparação é feita via hash matching');
  
  console.log('\n🎫 Segurança dos Tokens:');
  console.log('   - Tokens JWT com expiração de 7 dias');
  console.log('   - Assinatura com chave secreta (JWT_SECRET)');
  console.log('   - Contém: ID, email, tipo de usuário');
  console.log('   - Verificação automática em rotas protegidas');
  
  console.log('\n🛡️ Controle de Acesso:');
  console.log('   - Role-based: admin, professional, company');
  console.log('   - Middlewares de autenticação e autorização');
  console.log('   - Usuários só veem seus próprios dados');
  console.log('   - Contatos ocultos para visitantes não logados');
  
  console.log('\n💾 Banco de Dados:');
  console.log('   - PostgreSQL no Supabase (criptografado)');
  console.log('   - Conexão SSL obrigatória');
  console.log('   - Tabelas: users, professionals, companies');
  console.log('   - Soft delete (usuários desativados, não removidos)');
}

// ===================================
// MENU INTERATIVO
// ===================================
async function showMenu() {
  console.log('\n🎛️ GERENCIAMENTO DE USUÁRIOS');
  console.log('═'.repeat(50));
  console.log('1. 📋 Listar todos os usuários');
  console.log('2. 📊 Ver estatísticas do sistema');
  console.log('3. 🔐 Informações de segurança');
  console.log('4. 🗑️ Excluir usuário (digite o ID)');
  console.log('5. 🔄 Ativar/Desativar usuário');
  console.log('═'.repeat(50));
  
  // Para usar interativamente, descomente as linhas abaixo:
  // const readline = require('readline');
  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout
  // });
  
  // Por enquanto, vamos executar a opção 1 por padrão:
  await listAllUsers();
  await getSystemStats();
  await showSecurityInfo();
}

// Executar menu
showMenu();

// ===================================
// FUNÇÕES UTILITÁRIAS PARA USO DIRETO
// ===================================

// Para excluir um usuário específico:
// deleteUser('ID_DO_USUARIO_AQUI');

// Para ativar/desativar um usuário:
// toggleUserStatus('ID_DO_USUARIO_AQUI');

console.log('\n💡 DICAS DE USO:');
console.log('• Para excluir usuário: descomente e ajuste deleteUser("ID_AQUI")');
console.log('• Para alterar status: descomente toggleUserStatus("ID_AQUI")');
console.log('• IDs dos usuários aparecem na listagem acima');
console.log('• Senhas já estão seguras com bcrypt - não precisa alterar nada!');