// src/models/Indication.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Indication extends Model {
    static associate(models) {
      // Uma indicação pertence a um profissional que indica
      Indication.belongsTo(models.Professional, {
        foreignKey: 'from_professional_id',
        as: 'fromProfessional'
      });
      
      // Uma indicação pertence a um profissional que é indicado
      Indication.belongsTo(models.Professional, {
        foreignKey: 'to_professional_id',
        as: 'toProfessional'
      });
    }
  }
  
  Indication.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    from_professional_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'professionals',
        key: 'id'
      }
    },
    to_professional_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'professionals',
        key: 'id'
      }
    },
    // Campos extras do seu JSON de indicationsReceived
    professional_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Indication',
    tableName: 'indications',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['from_professional_id', 'to_professional_id']
      }
    ]
  });
  
  return Indication;
};