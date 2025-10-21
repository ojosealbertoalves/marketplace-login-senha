// backend/src/config/cloudinary.js - VERSÃO FINAL
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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

// Multer upload para fotos de portfólio (múltiplas)
export const uploadPortfolioPhotos = multer({
  storage: portfolioStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB por arquivo
  }
});

// Função para deletar imagem do Cloudinary
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Imagem deletada do Cloudinary: ${publicId}`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return false;
  }
};

// Extrair public_id da URL do Cloudinary
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  
  // Incluir pasta no public_id
  const folderIndex = parts.indexOf('catalogopro');
  if (folderIndex !== -1) {
    return parts.slice(folderIndex, parts.length - 1).join('/') + '/' + publicId;
  }
  
  return publicId;
};

export default cloudinary;