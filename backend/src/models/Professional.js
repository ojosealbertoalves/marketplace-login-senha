// src/models/Professional.js - VERSÃO ATUALIZADA
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Professional extends Model {
    static associate(models) {
      // NOVO: Um profissional pertence a um usuário
      Professional.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Um profissional pertence a uma categoria
      Professional.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      
      // Um profissional pertence a uma cidade
      Professional.belongsTo(models.City, {
        foreignKey: 'city_id',
        as: 'cityRelation'
      });
      
      // Relacionamento many-to-many com subcategorias
      Professional.belongsToMany(models.Subcategory, {
        through: 'professional_subcategories',
        foreignKey: 'professional_id',
        otherKey: 'subcategory_id',
        as: 'subcategories'
      });
      
      // Um profissional tem muitos projetos de portfolio
      Professional.hasMany(models.PortfolioItem, {
        foreignKey: 'professional_id',
        as: 'portfolio'
      });
      
      // Indicações dadas e recebidas
      Professional.hasMany(models.Indication, {
        foreignKey: 'from_professional_id',
        as: 'indicationsGiven'
      });
      
      Professional.hasMany(models.Indication, {
        foreignKey: 'to_professional_id',
        as: 'indicationsReceived'
      });
    }
  }
  
  Professional.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    // NOVO CAMPO: Relacionamento com User
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // Permitir null para compatibilidade com dados existentes
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
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
    profile_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    city_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id'
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    education: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    social_media: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    business_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    google_maps_link: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Professional',
    tableName: 'professionals',
    timestamps: true,
    underscored: true
  });
  
  return Professional;
};