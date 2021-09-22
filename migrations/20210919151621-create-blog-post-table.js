'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('blogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
      },
      author: {
        allowNull: true,
        type: Sequelize.STRING
      },
      title: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      body: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      image: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      publish: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('blogs');
  }
};