// testDB.js
import sequelize from './src/config/db.js';

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida!');
    
    const [[result]] = await sequelize.query('SELECT COUNT(*) as count FROM categories');
    console.log(`📂 Categorias no banco: ${result.count}`);
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testConnection();