// backend/src/models/PortfolioItem.js - COM GERAÇÃO AUTOMÁTICA DE ID
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const PortfolioItem = sequelize.define('PortfolioItem', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      // ✅ GERAÇÃO AUTOMÁTICA DE ID
      defaultValue: () => `port-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    professional_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'professionals',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
      type: DataTypes.JSON,
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
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'portfolio_items',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return PortfolioItem;
};