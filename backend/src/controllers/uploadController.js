// backend/src/controllers/uploadController.js - VERSÃO FINAL
import db from '../models/index.js';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

// Upload de foto de perfil
export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📤 Upload iniciado para usuário:', userId);
    
    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhuma imagem foi enviada'
      });
    }

    const photoUrl = req.file.path;
    console.log('📷 URL da foto:', photoUrl);

    // Buscar usuário
    const user = await db.User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Deletar foto antiga do Cloudinary se existir
    if (user.profile_photo) {
      console.log('🗑️ Deletando foto antiga:', user.profile_photo);
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
      data: {
        imageUrl: photoUrl
      }
    });

  } catch (error) {
    console.error('❌ Erro ao fazer upload da foto de perfil:', error);
    res.status(500).json({
      error: 'Erro ao fazer upload da foto',
      details: error.message
    });
  }
};

// Deletar foto de perfil
export const deleteProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🗑️ Iniciando deleção de foto para usuário:', userId);

    const user = await db.User.findByPk(userId);
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }
    
    if (!user.profile_photo) {
      console.log('⚠️ Usuário não tem foto de perfil');
      return res.status(404).json({
        error: 'Foto de perfil não encontrada'
      });
    }

    console.log('📸 Foto atual:', user.profile_photo);

    // Deletar do Cloudinary
    const publicId = getPublicIdFromUrl(user.profile_photo);
    console.log('🔑 Public ID:', publicId);
    
    if (publicId) {
      const deleted = await deleteImage(publicId);
      if (deleted) {
        console.log('✅ Foto deletada do Cloudinary');
      } else {
        console.log('⚠️ Não foi possível deletar do Cloudinary');
      }
    }

    // Remover do banco de dados
    await user.update({ profile_photo: null });
    console.log('✅ Foto removida do banco de dados');

    console.log(`🎉 Foto de perfil removida com sucesso para usuário: ${userId}`);

    res.json({
      success: true,
      message: 'Foto de perfil removida com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar foto de perfil:', error);
    res.status(500).json({
      error: 'Erro ao deletar foto',
      details: error.message
    });
  }
};