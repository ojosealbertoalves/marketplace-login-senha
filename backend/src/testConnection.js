// backend/src/testConnection.js
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    console.log('📊 Database:', process.env.DB_NAME);
    console.log('🏠 Host:', process.env.DB_HOST);
    console.log('🔌 Port:', process.env.DB_PORT);
    console.log('👤 User:', process.env.DB_USERNAME);
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();