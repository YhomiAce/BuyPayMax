'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Withdrawals', {
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
      acct_name: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      acct_number: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      bank_name: {
        allowNull: true,
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('Withdrawals');
  }
};