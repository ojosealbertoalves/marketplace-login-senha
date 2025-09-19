// src/models/Subcategory.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Subcategory extends Model {
    static associate(models) {
      // Uma subcategoria pertence a uma categoria
      Subcategory.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      
      // Relacionamento many-to-many com profissionais
      Subcategory.belongsToMany(models.Professional, {
        through: 'professional_subcategories',
        foreignKey: 'subcategory_id',
        otherKey: 'professional_id',
        as: 'professionals'
      });
    }
  }
  
  Subcategory.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Subcategory',
    tableName: 'subcategories',
    timestamps: true,
    underscored: true
  });
  
  return Subcategory;
};