'use strict';
const {
  Model
} = require('sequelize');
const dayjs = require("dayjs");

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      Payment.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }

  }
  
  Payment.init({
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
    payment_category: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    payment_reference: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    
  }, {
    sequelize,
    modelName: 'Payment',
    timestamps: true,
    paranoid: true,
    tableName: 'paystack_payments',
  });
  // Payment.sync({force: true})
  return Payment;
};