// server.js - Servidor Principal Modularizado COM ANTI-SCRAPING

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Importar rotas e middlewares
import routes from './src/routes/index.js';
import errorHandler from './src/middleware/errorHandler.js';
import dataManager from './src/utils/dataManager.js';
import antiScraping from './src/middleware/antiScraping.js';

// Configurações
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ MIDDLEWARES DE SEGURANÇA (ANTES DE TUDO)
app.use(antiScraping.blockSuspiciousAgents); // Bloquear bots
app.use(antiScraping.checkReferer); // Verificar origem
app.use(antiScraping.logSuspiciousActivity); // Registrar suspeitas

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🛡️ RATE LIMITING GERAL
app.use('/api', antiScraping.apiRateLimiter);

// Rotas principais
app.use('/api', routes);

// 🌐 SERVIR FRONTEND EM PRODUÇÃO
if (process.env.NODE_ENV === 'production') {
  // Servir arquivos estáticos do React
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Redirecionar todas as rotas não-API para o index.html do React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

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
    console.log('🛡️ Proteção Anti-Scraping:');
    console.log('   ✅ Rate Limiting (100/15min)');
    console.log('   ✅ User-Agent Detection');
    console.log('   ✅ Referer Check');
    console.log('   ✅ Activity Logging');
    console.log('🚀 ================================');
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log('✅ PRONTO PARA USAR!');
    console.log('🚀 ================================');
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error.message);
  }
});

export default app;