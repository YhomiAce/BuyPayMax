'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('externals', {
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
      name:{
        type:Sequelize.STRING,
        allowNull: false
      },
      email:{
        type:Sequelize.STRING,
        allowNull: false
      },
      coinId:{
        type:Sequelize.UUID,
        allowNull: false
      },
      quantity:{
        type:Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      }, 
      amount:{
        type:Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      currentRate:{
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
        type: Sequelize.STRING,
        allowNull: true
      },
      dollarAmount:{
        type:Sequelize.FLOAT,
        defaultValue: 0,
        allowNull: true
      },
      currentDollarRate:{
        type:Sequelize.FLOAT,
        defaultValue: 0,
        allowNull: true
      },
      sellBy: {
        type:Sequelize.ENUM("usd","naira", "qty"),
        allowNull: true
      },
      transaction: {
        type:Sequelize.STRING,
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
    await queryInterface.dropTable('externals');
  }
};