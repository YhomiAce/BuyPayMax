'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class KYC extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      KYC.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  };
  KYC.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    user_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    type: {
      allowNull: true,
      type: DataTypes.STRING
    },
    image: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    status: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'KYC',
    tableName: 'documents',
    timestamps: true,
    paranoid: true
  });
  return KYC;
};