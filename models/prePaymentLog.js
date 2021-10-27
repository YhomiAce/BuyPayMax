'use strict';
const {
  Model
} = require('sequelize');
const dayjs = require("dayjs");

module.exports = (sequelize, DataTypes) => {
  class PrePayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      PrePayment.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }

  }
  
  PrePayment.init({
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
    coinId: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    amountSent: {
      type: DataTypes.FLOAT
    },
    quantity: {
      type: DataTypes.FLOAT
    },
    reference: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    wallet_address: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    currency: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    
  }, {
    sequelize,
    modelName: 'PrePayment',
    timestamps: true,
    paranoid: true,
    tableName: 'pre_payment_logs',
  });
  // Payment.sync({force: true})
  return PrePayment;
};