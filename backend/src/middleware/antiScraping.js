// backend/src/middleware/antiScraping.js - PROTEÇÃO CONTRA SCRAPING

import rateLimit from 'express-rate-limit';

// 1️⃣ RATE LIMITING - Limitar requisições por IP
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit mais restritivo para busca de profissionais
export const professionalRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 30, // 30 requisições por IP
  message: {
    error: 'Limite de buscas atingido. Aguarde 5 minutos.'
  }
});

// 2️⃣ DETECTAR USER-AGENTS SUSPEITOS
const suspiciousBots = [
  'scrapy', 'crawler', 'spider', 'bot', 'scraper',
  'curl', 'wget', 'python', 'requests', 'axios',
  'postman', 'insomnia', 'httpclient'
];

export const blockSuspiciousAgents = (req, res, next) => {
  const userAgent = req.get('user-agent')?.toLowerCase() || '';
  
  // Bloquear se não tiver user-agent
  if (!userAgent) {
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }
  
  // Bloquear bots conhecidos
  const isSuspicious = suspiciousBots.some(bot => userAgent.includes(bot));
  if (isSuspicious) {
    console.log(`🚫 Bot bloqueado: ${userAgent} - IP: ${req.ip}`);
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }
  
  next();
};

// 3️⃣ HONEYPOT - Campo falso para pegar bots
export const honeypotCheck = (req, res, next) => {
  // Se o campo honeypot foi preenchido, é um bot
  if (req.body.website || req.body.url || req.body.homepage) {
    console.log(`🍯 Honeypot ativado! IP: ${req.ip}`);
    return res.status(400).json({
      error: 'Formulário inválido'
    });
  }
  next();
};

// 4️⃣ VERIFICAR REFERER
export const checkReferer = (req, res, next) => {
  const referer = req.get('referer') || req.get('origin') || '';
  const allowedDomains = [
    'localhost',
    'construgo.com.br', // Seu domínio de produção
    '127.0.0.1'
  ];
  
  // Permitir se vier de domínio permitido
  const isAllowed = allowedDomains.some(domain => referer.includes(domain));
  
  if (!referer || !isAllowed) {
    // Não bloquear completamente, mas registrar
    console.log(`⚠️ Acesso sem referer válido: ${req.ip} - ${referer}`);
  }
  
  next();
};

// 5️⃣ LIMITAR INFORMAÇÕES RETORNADAS
export const sanitizeResponse = (req, res, next) => {
  // Interceptar res.json para sanitizar
  const originalJson = res.json.bind(res);
  
  res.json = (data) => {
    // Se não estiver autenticado, limitar informações
    if (!req.user) {
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.map(prof => ({
          id: prof.id,
          name: prof.name,
          category: prof.category,
          city: prof.city,
          state: prof.state,
          // NÃO retornar: email, phone, whatsapp completos
          profile_photo: prof.profile_photo
        }));
      }
    }
    
    return originalJson(data);
  };
  
  next();
};

// 6️⃣ TOKEN DE ACESSO (CAPTCHA simples)
const accessTokens = new Map();

export const generateAccessToken = (req, res) => {
  const token = Math.random().toString(36).substring(2);
  const ip = req.ip;
  
  accessTokens.set(ip, {
    token,
    timestamp: Date.now(),
    uses: 0
  });
  
  // Limpar tokens antigos (>1h)
  setTimeout(() => {
    accessTokens.delete(ip);
  }, 60 * 60 * 1000);
  
  res.json({ token });
};

export const verifyAccessToken = (req, res, next) => {
  const token = req.header('X-Access-Token');
  const ip = req.ip;
  const stored = accessTokens.get(ip);
  
  if (!stored || stored.token !== token) {
    return res.status(403).json({
      error: 'Token de acesso inválido'
    });
  }
  
  // Limitar usos do token
  stored.uses++;
  if (stored.uses > 50) {
    accessTokens.delete(ip);
    return res.status(429).json({
      error: 'Token expirado'
    });
  }
  
  next();
};

// 7️⃣ LOGS DE ACESSO SUSPEITO
export const logSuspiciousActivity = (req, res, next) => {
  const suspicious = [];
  
  // Muitas requisições em pouco tempo
  // Acessando muitos perfis diferentes
  // Padrões de scraping (ordem alfabética, ID sequencial)
  
  if (suspicious.length > 0) {
    console.log(`🔍 Atividade suspeita:`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      path: req.path,
      reasons: suspicious
    });
  }
  
  next();
};

export default {
  apiRateLimiter,
  professionalRateLimiter,
  blockSuspiciousAgents,
  honeypotCheck,
  checkReferer,
  sanitizeResponse,
  generateAccessToken,
  verifyAccessToken,
  logSuspiciousActivity
};