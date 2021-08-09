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
      productId: {
        allowNull: false,
        type: Sequelize.UUID
    },
    exchangeRate: {
      allowNull: true,
      type: Sequelize.FLOAT,
      defaultValue:0
    },
    dollarRate: {
      allowNull: true,
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    nairaRate: {
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