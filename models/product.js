'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  product.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    name: {
        allowNull: true,
        type: DataTypes.STRING
    },
    symbol: {
      allowNull: true,
      type: DataTypes.STRING
    },
    rate: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    dollarRate: {
      allowNull: true,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    paranoid: true
  });
  return product;
};