// backend/src/models/User.js - COM TIPO CLIENT
import { Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Relacionamento opcional com Professional (quando user_type = 'professional')
      User.hasOne(models.Professional, {
        foreignKey: 'user_id',
        as: 'professionalProfile'
      });
      
      // Relacionamento opcional com Company (quando user_type = 'company')
      User.hasOne(models.Company, {
        foreignKey: 'user_id',
        as: 'companyProfile'
      });
    }

    // Método para validar senha
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    // Método para gerar JWT token
    generateToken() {
      return jwt.sign(
        { 
          id: this.id, 
          email: this.email, 
          userType: this.user_type,
          name: this.name 
        },
        process.env.JWT_SECRET || 'seu-jwt-secret-aqui',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
    }

    // Método para verificar permissões
    hasPermission(action) {
      const permissions = {
        'admin': [
          'view_all_users',
          'create_categories',
          'delete_categories',
          'create_cities',
          'delete_cities',
          'delete_users',
          'view_all_data'
        ],
        'professional': [
          'view_own_profile',
          'edit_own_profile',
          'indicate_professionals',
          'view_contact_info'
        ],
        'company': [
          'view_own_profile',
          'edit_own_profile',
          'indicate_professionals',
          'view_contact_info',
          'create_job_openings'
        ],
        // ✨ NOVO: Permissões do cliente final
        'client': [
          'view_professionals', // Pode ver profissionais
          'view_contact_info',  // Pode ver informações de contato
          'view_own_profile',   // Pode ver seu próprio perfil
          'edit_own_profile'    // Pode editar seu próprio perfil
        ]
      };

      return permissions[this.user_type]?.includes(action) || false;
    }
  }
  
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Documento (CPF ou CNPJ)
    documento: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        isValidDocument(value) {
          if (value) {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length !== 11 && cleaned.length !== 14) {
              throw new Error('Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)');
            }
          }
        }
      }
    },
    // ✨ Tipo de usuário - AGORA COM CLIENT
    user_type: {
      type: DataTypes.ENUM('admin', 'professional', 'company', 'client'),
      allowNull: false,
      defaultValue: 'client' // Cliente como padrão
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    profile_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    email_verification_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      // Hash da senha antes de salvar
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  });
  
  return User;
};