'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: true,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING
      },
      activated:{
        allowNull: true,
        type: Sequelize.TINYINT,
        defaultValue: 0,
      },
      email_token: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      wallet: {
        allowNull: true,
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      revenue: {
        allowNull: true,
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      ledger: {
        allowNull: true,
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      mining: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      walletAddress: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      referral_count: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      referral_amount: {
        allowNull: true,
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      password: {
        allowNull: true,
        type: Sequelize.STRING
      },
      reference: {
        allowNull: true,
        type: Sequelize.STRING
      },
      referral_id: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      oauth_id: {
        allowNull: true,
        type: Sequelize.STRING
      },
      oauth_token: {
        allowNull: true,
        type: Sequelize.STRING
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
    await queryInterface.dropTable('users');
  }
};