// src/models/PortfolioItem.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class PortfolioItem extends Model {
    static associate(models) {
      // Um item de portfolio pertence a um profissional
      PortfolioItem.belongsTo(models.Professional, {
        foreignKey: 'professional_id',
        as: 'professional'
      });
    }
  }
  
  PortfolioItem.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    professional_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'professionals',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    images: {
      type: DataTypes.JSON, // Array de URLs das imagens
      allowNull: true,
      defaultValue: []
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    project_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'PortfolioItem',
    tableName: 'portfolio_items',
    timestamps: true,
    underscored: true
  });
  
  return PortfolioItem;
};
