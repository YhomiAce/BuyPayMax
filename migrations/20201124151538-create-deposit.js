'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Deposits', {
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
        allowNull: true,
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      reference: {
        allowNull: true,
        type: Sequelize.STRING
      },
      channel: {
        allowNull: true,
        type: Sequelize.STRING
      },
      walletAddressId: {
        allowNull: true,
        type: Sequelize.UUID
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM("pending", "completed"),
        defaultValue: "pending"
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
    await queryInterface.dropTable('Deposits');
  }
};