'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Coin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Coin.belongsTo(models.User, {
      //   foreignKey: "userId",
      //   as: "users"
      // });
      Coin.belongsTo(models.Product, {
        foreignKey: "coinId",
        as: "coinTypes"
      });

    }
  };
  Coin.init({
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
    balance:{
      type:DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Coin',
    tableName:"coins",
    timestamps: true,
    paranoid: true
  });
  return Coin;
};