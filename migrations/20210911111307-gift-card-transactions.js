'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gift_card_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
      },
      traderId:{
        type:Sequelize.UUID,
        allowNull: false
      },
      userId:{
        type:Sequelize.UUID,
        allowNull: true
      },
      cardId:{
        type:Sequelize.UUID,
        allowNull: true
      },
      name:{
        type:Sequelize.STRING,
        allowNull: true
      },
      email:{
        type:Sequelize.STRING,
        allowNull: true
      },
      bankName:{
        type:Sequelize.STRING,
        allowNull: true
      },
      acctName:{
        type:Sequelize.STRING,
        allowNull: true
      },
      acctNumber:{
        type:Sequelize.STRING,
        allowNull: true
      },
      quantity:{
        type:Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      }, 
      amountPaid:{
        type:Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      reference: {
        type:Sequelize.STRING,
        allowNull: false
      },
      status: {
        type:Sequelize.ENUM("pending", "approved", "unapproved"),
        defaultValue: "pending"
      },
      receipt: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('gift_card_transactions');
  }
};