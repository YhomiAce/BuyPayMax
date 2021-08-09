'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class rate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  rate.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    productId: {
        allowNull: false,
        type: DataTypes.UUID
    },
    exchangeRate: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue:0
    },
    dollarRate: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    nairaRate: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'rate',
    tableName: 'rates',
    timestamps: true,
    paranoid: true
  });
  return rate;
};