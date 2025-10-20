// backend/addClientType.js - Adicionar tipo 'client' ao enum
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function addClientType() {
  console.log('🔧 Adicionando tipo "client" ao enum user_type...\n');

  // Criar conexão com o banco usando variáveis separadas
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  );

  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados Supabase');

    // Primeiro, verificar se 'client' já existe
    console.log('🔍 Verificando se tipo "client" já existe...');
    
    const [existingValues] = await sequelize.query(`
      SELECT e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'enum_users_user_type'
      AND e.enumlabel = 'client';
    `);

    if (existingValues.length > 0) {
      console.log('⚠️  Tipo "client" já existe no enum!');
    } else {
      console.log('➕ Adicionando tipo "client"...');
      
      // Adicionar 'client' ao enum de forma simples
      await sequelize.query(`ALTER TYPE "enum_users_user_type" ADD VALUE 'client';`);
      
      console.log('✅ Tipo "client" adicionado com sucesso!');
    }

    console.log('\n📋 Valores do enum agora:');
    
    // Verificar todos os valores do enum
    const [results] = await sequelize.query(`
      SELECT e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'enum_users_user_type'
      ORDER BY e.enumsortorder;
    `);
    
    console.log(results.map(r => `   - ${r.value}`).join('\n'));
    console.log('\n🎉 Pronto! Agora você pode usar o tipo "client"');

  } catch (error) {
    console.error('❌ Erro ao adicionar tipo client:', error.message);
    
    // Se o erro for que o valor já existe, não é um problema
    if (error.message.includes('already exists')) {
      console.log('⚠️  O valor "client" já existe no enum. Tudo certo!');
    } else {
      console.error('\nDetalhes:', error);
    }
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexão fechada');
  }
}

// Executar
addClientType();