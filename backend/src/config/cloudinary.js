// backend/src/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Teste de configuração (para debug)
console.log('🔧 Cloudinary configurado:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'não configurado'
});

// Storage para fotos de perfil
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'catalogopro/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' }
    ]
  }
});

// Storage para fotos de portfólio
const portfolioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'catalogopro/portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' }
    ]
  }
});

// Multer upload para foto de perfil
export const uploadProfilePhoto = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Multer upload para fotos de portfólio
export const uploadPortfolioPhotos = multer({
  storage: portfolioStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Função para deletar imagem do Cloudinary
export const deleteImage = async (publicId) => {
  try {
    console.log('🗑️ Tentando deletar imagem:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Resultado da deleção:', result);
    return result.result === 'ok';
  } catch (error) {
    console.error('❌ Erro ao deletar imagem do Cloudinary:', error);
    return false;
  }
};

// Extrair public_id da URL do Cloudinary
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // URL exemplo: https://res.cloudinary.com/dozqmklvu/image/upload/v1234567890/catalogopro/profiles/abc123.jpg
    const parts = url.split('/');
    
    // Encontrar o índice de 'upload'
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Pegar tudo depois de 'upload' e da versão (v1234...)
    const afterUpload = parts.slice(uploadIndex + 2); // Pula 'upload' e 'v1234...'
    
    // Juntar o caminho e remover a extensão
    const pathWithExtension = afterUpload.join('/');
    const publicId = pathWithExtension.substring(0, pathWithExtension.lastIndexOf('.'));
    
    console.log('📋 Public ID extraído:', publicId);
    return publicId;
  } catch (error) {
    console.error('❌ Erro ao extrair public_id:', error);
    return null;
  }
};

export default cloudinary;