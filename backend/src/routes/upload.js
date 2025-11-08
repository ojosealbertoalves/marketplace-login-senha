// backend/src/routes/upload.js - COM ERROR HANDLER PARA MULTER
import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateToken } from '../middleware/auth.js';
import db from '../models/index.js';

const router = Router();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'didnlhriq',
  api_key: process.env.CLOUDINARY_API_KEY || '336281229289862',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'hXVfmEEDwru5twdMWhgFmueF0dU'
});

console.log('🔧 Cloudinary configurado:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'didnlhriq',
  api_key: '***' + (process.env.CLOUDINARY_API_KEY || '336281229289862').slice(-4)
});

// Configurar multer para memória
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 Arquivo recebido:', file.originalname, '| Tipo:', file.mimetype);
    
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Função helper para upload no Cloudinary
const uploadToCloudinary = (buffer, folder = 'profiles') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `catalogopro/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

// ✅ MIDDLEWARE DE ERROR HANDLER PARA MULTER
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log('❌ Erro do Multer:', err.message);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Arquivo muito grande. Máximo: 5MB'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Nome do campo incorreto. Use "photo" para foto de perfil ou "photos" para portfolio'
      });
    }
    
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  if (err) {
    console.log('❌ Erro capturado:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
  
  next();
};

// ✅ Upload de foto de perfil - ACEITA "photo"
router.post('/profile-photo', 
  authenticateToken,
  (req, res, next) => {
    console.log('📤 Iniciando upload de foto de perfil...');
    console.log('👤 Usuário:', req.user?.id);
    next();
  },
  upload.single('photo'),
  handleMulterError,
  async (req, res) => {
    try {
      console.log('📤 Upload iniciado para usuário:', req.user.id);
      console.log('📁 Arquivo recebido:', req.file ? 'SIM' : 'NÃO');
      
      if (!req.file) {
        console.log('❌ Nenhum arquivo enviado');
        return res.status(400).json({
          success: false,
          error: 'Nenhuma imagem foi enviada'
        });
      }

      const userId = req.user.id;

      // Upload para Cloudinary
      console.log('☁️ Fazendo upload para Cloudinary...');
      const result = await uploadToCloudinary(req.file.buffer, 'profiles');
      const photoUrl = result.secure_url;

      console.log('📷 URL da foto no Cloudinary:', photoUrl);

      // Buscar usuário
      const user = await db.User.findByPk(userId);
      if (!user) {
        console.log('❌ Usuário não encontrado');
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      console.log('👤 Usuário encontrado:', user.name, '| Tipo:', user.user_type);

      // Atualizar foto no usuário
      await user.update({ profile_photo: photoUrl });
      console.log('✅ Foto atualizada na tabela users');

      // ✅ SE FOR PROFISSIONAL, ATUALIZAR TAMBÉM NA TABELA PROFESSIONALS
      if (user.user_type === 'professional') {
        const professional = await db.Professional.findOne({
          where: { user_id: userId }
        });

        if (professional) {
          await professional.update({ profile_photo: photoUrl });
          console.log('✅ Foto atualizada na tabela professionals');
        } else {
          console.log('⚠️ Profissional não encontrado para este usuário');
        }
      }

      console.log(`🎉 Foto de perfil atualizada com sucesso para usuário: ${userId}`);

      res.json({
        success: true,
        photoUrl: photoUrl,
        message: 'Foto de perfil atualizada com sucesso',
        data: {
          imageUrl: photoUrl
        }
      });

    } catch (error) {
      console.error('❌ Erro ao fazer upload da foto de perfil:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Erro ao fazer upload da foto',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

// ✅ Deletar foto de perfil
router.delete('/profile-photo',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      console.log('🗑️ Iniciando deleção de foto para usuário:', userId);

      const user = await db.User.findByPk(userId);
      
      if (!user) {
        console.log('❌ Usuário não encontrado');
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }
      
      if (!user.profile_photo) {
        console.log('⚠️ Usuário não tem foto de perfil');
        return res.status(200).json({
          success: true,
          message: 'Não há foto de perfil para remover'
        });
      }

      console.log('📸 Foto atual:', user.profile_photo);

      // Remover do USUÁRIO
      await user.update({ profile_photo: null });
      console.log('✅ Foto removida da tabela users');

      // ✅ SE FOR PROFISSIONAL, REMOVER TAMBÉM DA TABELA PROFESSIONALS
      if (user.user_type === 'professional') {
        const professional = await db.Professional.findOne({
          where: { user_id: userId }
        });

        if (professional) {
          await professional.update({ profile_photo: null });
          console.log('✅ Foto removida da tabela professionals');
        }
      }

      console.log(`🎉 Foto de perfil removida com sucesso para usuário: ${userId}`);

      res.json({
        success: true,
        message: 'Foto de perfil removida com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao deletar foto de perfil:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar foto',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

// ✅ Upload de fotos do portfólio (múltiplas) - ACEITA "photos"
router.post('/portfolio-photos',
  authenticateToken,
  upload.array('photos', 10),
  handleMulterError,
  async (req, res) => {
    try {
      console.log('📤 Upload de fotos de portfolio iniciado');
      console.log('📁 Arquivos recebidos:', req.files?.length || 0);
      
      if (!req.files || req.files.length === 0) {
        console.log('❌ Nenhum arquivo enviado');
        return res.status(400).json({
          success: false,
          error: 'Nenhuma imagem foi enviada'
        });
      }

      console.log(`☁️ Fazendo upload de ${req.files.length} foto(s) para Cloudinary...`);

      // Upload de todas as fotos em paralelo
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, 'portfolio')
      );

      const results = await Promise.all(uploadPromises);
      const photoUrls = results.map(result => result.secure_url);

      console.log(`✅ ${photoUrls.length} foto(s) de portfólio enviada(s) com sucesso`);
      console.log('📷 URLs:', photoUrls);

      res.json({
        success: true,
        photoUrls: photoUrls,
        message: `${photoUrls.length} foto(s) enviada(s) com sucesso`,
        data: {
          images: photoUrls,
          uploadedCount: photoUrls.length
        }
      });

    } catch (error) {
      console.error('❌ Erro ao fazer upload das fotos do portfolio:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Erro ao fazer upload das fotos',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

console.log('✅ Rotas de upload configuradas');

export default router;