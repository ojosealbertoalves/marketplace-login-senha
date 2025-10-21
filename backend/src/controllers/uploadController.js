// backend/src/controllers/uploadController.js
import db from '../models/index.js';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

// Upload de foto de perfil
export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhuma imagem foi enviada'
      });
    }

    const photoUrl = req.file.path;

    // Buscar usuário
    const user = await db.User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Deletar foto antiga do Cloudinary se existir
    if (user.profile_photo) {
      const oldPublicId = getPublicIdFromUrl(user.profile_photo);
      if (oldPublicId) {
        await deleteImage(oldPublicId);
      }
    }

    // Atualizar URL da foto no banco
    await user.update({ profile_photo: photoUrl });

    console.log(`✅ Foto de perfil atualizada para usuário: ${userId}`);

    res.json({
      success: true,
      message: 'Foto de perfil atualizada com sucesso',
      photoUrl
    });

  } catch (error) {
    console.error('Erro ao fazer upload da foto de perfil:', error);
    res.status(500).json({
      error: 'Erro ao fazer upload da foto',
      details: error.message
    });
  }
};

// Upload de fotos de portfólio
export const uploadPortfolioPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Nenhuma imagem foi enviada'
      });
    }

    const photoUrls = req.files.map(file => file.path);

    console.log(`✅ ${photoUrls.length} fotos de portfólio enviadas`);

    res.json({
      success: true,
      message: `${photoUrls.length} foto(s) enviada(s) com sucesso`,
      photoUrls
    });

  } catch (error) {
    console.error('Erro ao fazer upload das fotos de portfólio:', error);
    res.status(500).json({
      error: 'Erro ao fazer upload das fotos',
      details: error.message
    });
  }
};

// Deletar foto de perfil
export const deleteProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db.User.findByPk(userId);
    
    if (!user || !user.profile_photo) {
      return res.status(404).json({
        error: 'Foto de perfil não encontrada'
      });
    }

    // Deletar do Cloudinary
    const publicId = getPublicIdFromUrl(user.profile_photo);
    if (publicId) {
      await deleteImage(publicId);
    }

    // Remover do banco
    await user.update({ profile_photo: null });

    console.log(`🗑️ Foto de perfil removida para usuário: ${userId}`);

    res.json({
      success: true,
      message: 'Foto de perfil removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar foto de perfil:', error);
    res.status(500).json({
      error: 'Erro ao deletar foto',
      details: error.message
    });
  }
};