'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wallet_address', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      coinId: {
          allowNull: false,
          type: Sequelize.UUID
      },
      walletAddress: {
        allowNull: false,
        type: Sequelize.STRING
      },
      balance: {
        allowNull: true,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM("in_use", "pending"),
        defaultValue: "pending"
      },
      userId: {
        type: Sequelize.UUID,
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
    await queryInterface.dropTable('wallet_address');
  }
};