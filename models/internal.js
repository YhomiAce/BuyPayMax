'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Internal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Internal.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    userId:{
      type:DataTypes.UUID,
      allowNull: false
    },
    coinId:{
      type:DataTypes.UUID,
      allowNull: false
    },
    amount:{
      type:DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    reference: {
      type:DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Internal',
    tableName: "internals",
    timestamps: true,
    paranoid: true
  });
  return Internal;
};