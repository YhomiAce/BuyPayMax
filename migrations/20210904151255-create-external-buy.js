'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('internal_buys', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
      },
      userId:{
        type:Sequelize.UUID,
        allowNull: true
      },
      customerName:{
        type:Sequelize.STRING,
        allowNull: true
      },
      customerEmail:{
        type:Sequelize.STRING,
        allowNull: true
      },
      coinId:{
        type:Sequelize.UUID,
        allowNull: false
      },
      qty:{
        type:Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      dollarAmount:{
        type:Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      nairaAmount:{
        type:Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      medium: {
        type: Sequelize.ENUM("usd", "naira", "qty"),
        allowNull: true
      },
      exchange: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      status:{
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue:"pending"
      },
      reference: {
        type:Sequelize.STRING,
        allowNull: false
      },
      walletAddress:{
        type: Sequelize.STRING,
        allowNull: true
      },
      receipt:{
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('internal_buys');
  }
};