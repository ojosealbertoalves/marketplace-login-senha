// src/models/Category.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Uma categoria tem muitas subcategorias
      Category.hasMany(models.Subcategory, {
        foreignKey: 'category_id',
        as: 'subcategories'
      });
      
      // Uma categoria pode ter muitos profissionais
      Category.hasMany(models.Professional, {
        foreignKey: 'category_id',
        as: 'professionals'
      });
    }
  }
  
  Category.init({
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
      allowNull: false,
      unique: true
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    underscored: true
  });
  
  return Category;
};