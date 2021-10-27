'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Rate.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product"
      })
    }
  };
  Rate.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    name: {
      allowNull: true,
      type: DataTypes.STRING
    },
    currencyValue: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 1
    },
    naira: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    productId: {
      type: DataTypes.UUID
    }
  }, {
    sequelize,
    modelName: 'Rate',
    tableName: 'rates',
    timestamps: true,
    paranoid: true
  });
  return Rate;
};