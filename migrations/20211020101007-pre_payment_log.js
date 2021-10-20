'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pre_payment_logs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      user_id: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      amount: {
        type: Sequelize.FLOAT
      },
      realValue: {
        type: Sequelize.STRING
      },
      reference: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      wallet_address: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      currency: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      confirmed: {
        type: Sequelize.BOOLEAN,
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
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pre_payment_logs');
  }
};