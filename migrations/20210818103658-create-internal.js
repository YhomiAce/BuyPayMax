'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('internals', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
      },
      userId:{
        type:Sequelize.UUID,
        allowNull: false
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
      sellBy: {
        type: Sequelize.ENUM("usd", "naira", "qty"),
        allowNull: true
      },
      reference: {
        type:Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('internals');
  }
};