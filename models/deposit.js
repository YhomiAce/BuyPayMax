'use strict';
const {
  Model
} = require('sequelize');
const dayjs = require("dayjs");
module.exports = (sequelize, DataTypes) => {
  class Deposit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Deposit.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  };
  Deposit.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    user_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    amount: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    reference: {
      allowNull: true,
      type: DataTypes.STRING
    },
    channel: {
      allowNull: true,
      type: DataTypes.STRING
    },
    currency: {
      allowNull: true,
      type: DataTypes.STRING
    },
    walletAddress: {
      allowNull: true,
      type: DataTypes.STRING
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM("pending", "approved", "disapproved"),
      defaultValue: "pending"
    },
  }, {
    sequelize,
    modelName: 'Deposit',
    timestamps: true,
    paranoid: true,
    tableName: 'Deposits',
  });
  // Deposit.sync({force: true})
  return Deposit;
};