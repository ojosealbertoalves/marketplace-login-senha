// backend/src/controllers/uploadController.js - VERSÃO FINAL CORRIGIDA
import db from '../models/index.js';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

// ✅ Upload de foto de perfil - ATUALIZA USUÁRIO E PROFISSIONAL
export const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📤 Upload iniciado para usuário:', userId);
    console.log('📁 Arquivo recebido:', req.file ? 'SIM' : 'NÃO');
    
    if (!req.file) {
      console.log('❌ Nenhum arquivo enviado');
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem foi enviada'
      });
    }

    const photoUrl = req.file.path;
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

    // Deletar foto antiga do Cloudinary se existir
    if (user.profile_photo) {
      console.log('🗑️ Deletando foto antiga:', user.profile_photo);
      const oldPublicId = getPublicIdFromUrl(user.profile_photo);
      if (oldPublicId) {
        await deleteImage(oldPublicId);
        console.log('✅ Foto antiga deletada');
      }
    }

    // Atualizar URL da foto no USUÁRIO
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
      message: 'Foto de perfil atualizada com sucesso',
      photoUrl: photoUrl, // ✅ Retornar photoUrl para compatibilidade
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
};

// ✅ Deletar foto de perfil - REMOVE DE USUÁRIO E PROFISSIONAL
export const deleteProfilePhoto = async (req, res) => {
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
};

// ✅ Upload de fotos do portfolio
export const uploadPortfolioPhotos = async (req, res) => {
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

    // Extrair URLs das imagens enviadas
    const photoUrls = req.files.map(file => file.path);
    console.log('📷 URLs das fotos:', photoUrls);

    res.json({
      success: true,
      message: `${photoUrls.length} imagem(ns) enviada(s) com sucesso`,
      photoUrls: photoUrls, // ✅ Nome correto do campo
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
};