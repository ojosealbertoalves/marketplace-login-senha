// src/models/Company.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      // Uma empresa pertence a um usuário
      Company.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Uma empresa pode ter várias vagas (futuro)
      // Company.hasMany(models.JobOpening, {
      //   foreignKey: 'company_id',
      //   as: 'jobOpenings'
      // });
      
      // Uma empresa está em uma cidade
      Company.belongsTo(models.City, {
        foreignKey: 'city_id',
        as: 'cityRelation'
      });
    }
  }
  
  Company.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cnpj: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id'
      }
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    business_areas: {
      type: DataTypes.JSON, // Array de áreas de atuação
      allowNull: true,
      defaultValue: []
    },
    social_media: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    timestamps: true,
    underscored: true
  });
  
  return Company;
};