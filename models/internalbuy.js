'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InternalBuy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      InternalBuy.belongsTo(models.Product, {
        foreignKey: "coinId",
        as: "coin"
      });
      InternalBuy.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user"
      });
    }
  };
  InternalBuy.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    userId:{
      type:DataTypes.UUID,
      allowNull: true
    },
    customerName:{
      type:DataTypes.STRING,
      allowNull: true
    },
    customerEmail:{
      type:DataTypes.STRING,
      allowNull: true
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
    medium: {
      type: DataTypes.ENUM("usd", "naira", "qty"),
      allowNull: true
    },
    exchange: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    reference: {
      type:DataTypes.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'InternalBuy',
    tableName:"internal_buys",
    timestamps: true,
    paranoid: true
  });
  // InternalBuy.sync({force:true})
  return InternalBuy;
};