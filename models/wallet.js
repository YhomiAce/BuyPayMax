'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     static associate(models) {
      // define association here
      Wallet.belongsTo(models.Product, {
        foreignKey: "coinId",
        as: "coin"
      });
      Wallet.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user"
      });
      
    }
  };
  Wallet.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    coinId: {
        allowNull: true,
        type: DataTypes.UUID
    },
    walletAddress: {
      allowNull: true,
      type: DataTypes.STRING
    },
    balance: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0.0
    },
    status: {
      allowNull: true,
      type: DataTypes.ENUM("in_use", "pending"),
      defaultValue: "pending"
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Wallet',
    tableName: "wallet_address",
    timestamps: true,
    paranoid: true
  });
  // Wallet.sync();
  return Wallet;
};
