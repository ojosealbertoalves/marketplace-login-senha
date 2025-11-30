// backend/src/models/Company.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      Company.belongsTo(models.City, {
        foreignKey: 'city_id',
        as: 'cityRelation',
        required: false
      });

      Company.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
        required: false
      });

      Company.belongsToMany(models.Subcategory, {
        through: 'company_subcategories',
        foreignKey: 'company_id',
        otherKey: 'subcategory_id',
        as: 'subcategories'
      });
    }
  }
  
  Company.init({
    id: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING(18),
      allowNull: true,
      unique: true
    },
    category_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
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
      type: DataTypes.JSON,
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