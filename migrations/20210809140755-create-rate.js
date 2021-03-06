'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rates', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
    name: {
      allowNull: true,
      type: Sequelize.STRING
    },
    currencyValue: {
      allowNull: true,
      type: Sequelize.FLOAT,
      defaultValue: 1
    },
    naira: {
      allowNull: true,
      type: Sequelize.FLOAT,
      defaultValue: 0
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
    await queryInterface.dropTable('rates');
  }
};