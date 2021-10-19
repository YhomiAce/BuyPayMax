'use strict';
const {
  Model
} = require('sequelize');
const dayjs = require("dayjs");

module.exports = (sequelize, DataTypes) => {
  class Withdrawal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Withdrawal.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  Withdrawal.init({
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
    acct_name: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    acct_number: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    bank_name: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    bank_code: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    reference: {
      allowNull: true,
      type: DataTypes.STRING
    },
    recipient_code: {
      allowNull: true,
      type: DataTypes.STRING
    },
    transfer_code: {
      allowNull: true,
      type: DataTypes.STRING
    },
    status: {
      allowNull: true,
      type: DataTypes.ENUM("pending", "approved", "disapproved"),
      defaultValue: "pending",
    },
    meta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fileDoc: {
      allowNull: true,
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Withdrawal',
    timestamps: true,
    paranoid: true,
    tableName: 'Withdrawals',
  });
  // Withdrawal.sync({force:true})
  return Withdrawal;
};