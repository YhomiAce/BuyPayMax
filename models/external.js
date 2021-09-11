'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class External extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      External.belongsTo(models.Product, {
        foreignKey: "coinId",
        as: "coin"
      });
      External.belongsTo(models.Admin, {
        foreignKey: "traderId",
        as: "trader"
      });
    }
  };
  External.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    traderId:{
      type:DataTypes.UUID,
      allowNull: false
    },
    userId:{
      type:DataTypes.UUID,
      allowNull: true
    },
    name:{
      type:DataTypes.STRING,
      allowNull: false
    },
    email:{
      type:DataTypes.STRING,
      allowNull: false
    },
    coinId:{
      type:DataTypes.UUID,
      allowNull: false
    },
    quantity:{
      type:DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }, 
    amount:{
      type:DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    currentRate:{
      type:DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    reference: {
      type:DataTypes.STRING,
      allowNull: false
    },
    status: {
      type:DataTypes.ENUM("pending", "approved", "unapproved"),
      defaultValue: "pending"
    },
    receipt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dollarAmount:{
      type:DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: true
    },
    currentDollarRate:{
      type:DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: true
    },
    sellBy: {
      type:DataTypes.ENUM("usd","naira", "qty"),
      allowNull: true
    },
    transaction: {
      type:DataTypes.STRING,
      allowNull: true
    },
    bankName:{
      type:DataTypes.STRING,
      allowNull: true
    },
    acctName:{
      type:DataTypes.STRING,
      allowNull: true
    },
    acctNumber:{
      type:DataTypes.STRING,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'External',
    tableName: 'externals',
    paranoid: true,
    timestamps: true
  });
  // External.sync({force:true})
  return External;
};