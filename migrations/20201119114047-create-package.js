'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Packages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      fromPrice: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      toPrice: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      commission: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      duration: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      charge: {
        allowNull: true,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      bonus:{
        allowNull: true,
        type: Sequelize.STRING,
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
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Packages');
  }
};