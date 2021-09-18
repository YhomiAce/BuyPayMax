'use strict';
const {
  Model
} = require('sequelize');
const dayjs = require("dayjs");

module.exports = (sequelize, DataTypes) => {
  class WithdrawalCoin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      WithdrawalCoin.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      WithdrawalCoin.belongsTo(models.Product, {
        foreignKey: "coinId",
        as: "coin",
      });
    }
  }
  WithdrawalCoin.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    userId: {
    allowNull: true,
    type: DataTypes.UUID,
    },
    coinId: {
    allowNull: true,
    type: DataTypes.UUID,
    },
    amount: {
    allowNull: true,
    type: DataTypes.FLOAT,
    defaultValue: 0,
    },
    charge: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    walletAddress: {
    allowNull: true,
    type: DataTypes.TEXT,
    },
    coinType: {
    allowNull: true,
    type: DataTypes.STRING,
    },
    reference: {
    type: DataTypes.TEXT
    },
    status: {
    allowNull: true,
    type: DataTypes.ENUM("pending", "approved", "disapproved"),
    defaultValue: "pending",
    },
    fileDoc: {
    allowNull: true,
    type: DataTypes.TEXT
    },
  }, {
    sequelize,
    modelName: 'WithdrawalCoin',
    timestamps: true,
    paranoid: true,
    tableName: 'withdraw_coins',
  });
  // WithdrawalCoin.sync({force:true})
  return WithdrawalCoin;
};