'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Verification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Verification.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  };
  Verification.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    user_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    email_status: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    twofa_status: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    twofa_image: {
      allowNull: true,
      type: DataTypes.TEXT,
      defaultValue: "0",
    },
    email_code: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    twofa_code: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'Verification',
    timestamps: true,
    paranoid: true,
    tableName: 'Verifications',
  });
  return Verification;
};