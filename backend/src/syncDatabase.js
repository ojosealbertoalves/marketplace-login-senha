// backend/src/syncDatabase.js
import db from './models/index.js';

async function syncDatabase() {
  try {
    console.log('🔄 Iniciando sincronização do banco de dados...');
    console.log('📊 Conectando ao Supabase...');
    
    // Testa a conexão primeiro
    await db.sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');
    
    // Sincroniza todos os models com o banco
    // alter: true = ajusta as tabelas existentes
    // force: false = não apaga dados existentes
    await db.sequelize.sync({ alter: true });
    
    console.log('✅ Banco de dados sincronizado com sucesso!');
    
    // Lista as tabelas criadas
    const tables = await db.sequelize.getQueryInterface().showAllTables();
    console.log('\n📋 Tabelas criadas no Supabase:');
    tables.forEach(table => console.log(`   - ${table}`));
    
    console.log('\n🎉 Migração concluída! Seu banco está pronto no Supabase!');
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco:', error);
    console.error('Detalhes:', error.message);
  } finally {
    await db.sequelize.close();
  }
}

syncDatabase();