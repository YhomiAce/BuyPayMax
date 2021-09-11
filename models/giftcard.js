'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GiftCard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      GiftCard.belongsTo(models.Admin, {
        foreignKey: "traderId",
        as: "trader"
      });
      GiftCard.belongsTo(models.Card, {
        foreignKey: "cardId",
        as: "card"
      });
    }
  };
  GiftCard.init({
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
    cardId:{
      type:DataTypes.UUID,
      allowNull: true
    },
    name:{
      type:DataTypes.STRING,
      allowNull: true
    },
    email:{
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
    
    quantity:{
      type:DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }, 
    amountPaid:{
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
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'GiftCard',
    tableName: 'gift_card_transactions',
    paranoid: true,
    timestamps: true
  });
  // GiftCard.sync({force:true})
  return GiftCard;
};