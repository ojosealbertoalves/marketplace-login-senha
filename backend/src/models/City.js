// src/models/City.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class City extends Model {
    static associate(models) {
      // Uma cidade pode ter muitos profissionais
      City.hasMany(models.Professional, {
        foreignKey: 'city_id',
        as: 'professionals'
      });
    }
  }
  
  City.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    state_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'City',
    tableName: 'cities',
    timestamps: true,
    underscored: true
  });
  
  return City;
};