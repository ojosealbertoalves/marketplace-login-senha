
// server.js - Servidor Principal Modularizado

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Importar rotas e middlewares
import routes from './src/routes/index.js';
import errorHandler from './src/middleware/errorHandler.js';
import dataManager from './src/utils/dataManager.js';

// Configurações
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas principais
app.use('/api', routes);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, async () => {
  // Aguardar inicialização dos dados
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Carregar estatísticas dos dados
  try {
    const stats = await dataManager.getStats();
    
    console.log('🚀 ================================');
    console.log('🏗️  Marketplace Construção Civil');
    console.log('🚀 ================================');
    console.log(`🌐 Servidor: http://localhost:${PORT}`);
    console.log(`🧪 Teste: http://localhost:${PORT}/api/test`);
    console.log(`📊 Dados carregados:`);
    console.log(`   📂 ${stats.categories} categorias`);
    console.log(`   📂 ${stats.subcategories} subcategorias`);
    console.log(`   🏙️  ${stats.cities} cidades`);
    console.log(`   👷 ${stats.professionals} profissionais`);
    console.log(`   👤 ${stats.users} usuários`);
    console.log('🚀 ================================');
    console.log('📌 Estrutura Modularizada:');
    console.log('   ✅ Controllers organizados');
    console.log('   ✅ Routes separadas');
    console.log('   ✅ Utils centralizados');
    console.log('   ✅ Middlewares isolados');
    console.log('🚀 ================================');
    console.log('✅ PRONTO PARA USAR!');
    console.log('🚀 ================================');
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error.message);
  }
});

export default app;