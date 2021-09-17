'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Investments', {
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
      package_id: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      status: {
        allowNull: true,
        type: Sequelize.ENUM("active","inactive"),
        defaultValue: "active"
      },
      amount: {
        allowNull: true,
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      earning: {
        allowNull: true,
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      expiredAt: {
        allowNull: false,
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Investments');
  }
};