'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('withdraw_coins', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      userId: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      coinId: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      amount: {
        allowNull: true,
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      walletAddress: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      coinType: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      reference: {
        type: Sequelize.TEXT
      },
      status: {
        allowNull: true,
        type: Sequelize.ENUM("pending", "completed"),
        defaultValue: "pending",
      },
      fileDoc: {
        allowNull: true,
        type: Sequelize.TEXT
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
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('withdraw_coins');
  }
};