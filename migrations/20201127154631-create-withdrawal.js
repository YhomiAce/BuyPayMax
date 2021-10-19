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
      charge: {
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
      bank_code: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      reference: {
        allowNull: true,
        type: Sequelize.STRING
      },
      recipient_code: {
        allowNull: true,
        type: Sequelize.STRING
      },
      transfer_code: {
        allowNull: true,
        type: Sequelize.STRING
      },
      status: {
        allowNull: true,
        type: Sequelize.ENUM("pending", "approved", "disapproved"),
        defaultValue: "pending",
      },
      meta: {
        type: Sequelize.TEXT,
        allowNull: true
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
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Withdrawals');
  }
};