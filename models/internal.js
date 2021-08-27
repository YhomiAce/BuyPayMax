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
    qty:{
      type:DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    dollarAmount:{
      type:DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    nairaAmount:{
      type:DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    sellBy: {
      type: DataTypes.ENUM("usd", "naira", "qty"),
      allowNull: true
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
  // Internal.sync({force:true})
  return Internal;
};