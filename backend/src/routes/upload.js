// backend/src/routes/upload.js - ROTAS DE UPLOAD COM CLOUDINARY
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

// Configurar multer para memória (não salva em disco, envia direto para Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
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

// Upload de foto de perfil
router.post('/profile-photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const userId = req.user.id;

    // Upload para Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'profiles');
    const photoUrl = result.secure_url;

    console.log(`📤 Upload para Cloudinary: ${photoUrl}`);

    // Buscar usuário
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar foto no usuário
    await user.update({ profile_photo: photoUrl });

    // Se for profissional, atualizar também na tabela professionals
    if (user.user_type === 'professional' || user.user_type === 'company') {
      const professional = await db.Professional.findOne({ where: { user_id: userId } });
      if (professional) {
        await professional.update({ profile_photo: photoUrl });
      }
    }

    console.log(`✅ Foto de perfil atualizada para usuário ${userId}`);

    res.json({
      success: true,
      photoUrl,
      message: 'Foto atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({
      error: 'Erro ao fazer upload',
      details: error.message
    });
  }
});

// Upload de fotos do portfólio (múltiplas)
router.post('/portfolio-photos', authenticateToken, upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log(`📤 Fazendo upload de ${req.files.length} foto(s) para Cloudinary...`);

    // Upload de todas as fotos em paralelo
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, 'portfolio')
    );

    const results = await Promise.all(uploadPromises);
    const photoUrls = results.map(result => result.secure_url);

    console.log(`✅ ${photoUrls.length} foto(s) de portfólio enviada(s) com sucesso`);

    res.json({
      success: true,
      photoUrls,
      message: `${photoUrls.length} foto(s) enviada(s) com sucesso`
    });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({
      error: 'Erro ao fazer upload',
      details: error.message
    });
  }
});

export default router;