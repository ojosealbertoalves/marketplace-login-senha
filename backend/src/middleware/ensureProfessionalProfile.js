// backend/src/middleware/ensureProfessionalProfile.js
import db from '../models/index.js';

/**
 * Middleware para garantir que professional/company tem perfil criado
 * Cria automaticamente se não existir
 */
export const ensureProfessionalProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;

    // Se for cliente, não precisa de perfil profissional
    if (userType === 'client' || userType === 'admin') {
      return next();
    }

    // Buscar usuário completo
    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar/criar perfil profissional
    if (userType === 'professional' || userType === 'company') {
      let professional = await db.Professional.findOne({
        where: { user_id: userId }
      });

      // Se não existe, criar automaticamente
      if (!professional) {
        console.log(`⚠️ Criando perfil profissional automaticamente para: ${user.name}`);

        professional = await db.Professional.create({
          id: `prof-${Date.now()}`,
          user_id: userId,
          name: user.name,
          email: user.email,
          profile_photo: user.profile_photo,
          city: user.city || 'Não informado',
          state: user.state || 'N/A',
          is_active: true
        });

        console.log(`✅ Perfil profissional criado: ${professional.id}`);
      }
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar/criar perfil profissional:', error);
    next(); // Continuar mesmo com erro para não quebrar a aplicação
  }
};