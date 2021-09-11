module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
  */
    return queryInterface.sequelize.transaction(async t => {
      try {
        const bankNameColumn = await queryInterface.addColumn(
          "externals",
          "bankName",
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          {
            transaction: t
          }
        );

        const acctNameColumn = await queryInterface.addColumn(
          "externals",
          "acctName",
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          {
            transaction: t
          }
        );
        const acctNumberColumn = await queryInterface.addColumn(
          "externals",
          "acctNumber",
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          {
            transaction: t
          }
        );

        return Promise.all(bankNameColumn,acctNameColumn, acctNumberColumn);
      } catch (error) {
        return t.rollback();
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
    */
    const bankNameColumn = await queryInterface.removeColumn(
      "externals",
      "bankName",
      {}
    );
    const acctNameColumn = await queryInterface.removeColumn(
      "externals",
      "acctName",
      {}
    );
    const acctNumberColumn = await queryInterface.removeColumn(
      "externals",
      "acctNumber",
      {}
    );
    return Promise.all(bankNameColumn, acctNameColumn, acctNumberColumn);
  }
};
