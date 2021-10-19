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
  }, {
    sequelize,
    modelName: 'Rate',
    tableName: 'rates',
    timestamps: true,
    paranoid: true
  });
  return rate;
};