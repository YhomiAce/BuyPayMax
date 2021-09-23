'use strict';
const {
  Model
} = require('sequelize');
const dayjs = require("dayjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.BankDeposit, {
        foreignKey: "user_id",
        as: "bank_deposits"
      });
      User.hasMany(models.Coin, {
        foreignKey: "userId",
        as: "userCoins"
      });

      User.hasMany(models.Investment, {
        foreignKey: "user_id",
        as: "investments"
      });
      User.hasMany(models.Chat, {
        foreignKey: "sender_id",
        as: "chats"
      });

      User.hasMany(models.Coin, {
        foreignKey: "userId",
        as: "coins"
      });

      User.hasMany(models.Referral, {
        foreignKey: "user_id",
        as: "ref_user"
      });

      User.hasMany(models.Referral, {
        foreignKey: "referral_id",
        as: "refferrer"
      });

      User.hasMany(models.Withdrawal, {
        foreignKey: "user_id",
        as: "withdrawals"
      });

      User.hasOne(models.KYC, {
        foreignKey: "user_id",
        as: "kyc"
      });
    }
  };
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    name: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    email: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    email_token: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    activated:{
      allowNull: true,
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    phone: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    mining: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    wallet: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0.0
    },
    revenue: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    walletAddress: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    referral_count: {
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    referral_amount: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    password: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    reference: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    referral_id: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    oauth_id: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    oauth_token: {
      allowNull: true,
      type: DataTypes.STRING,
    }
    
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    paranoid: true,
    tableName: 'users',
  });
  // User.sync({force: true})
  return User;
};