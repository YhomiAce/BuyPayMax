module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
  */
    return queryInterface.sequelize.transaction(async t => {
      try {
        const maximumWithdrawalColumn = await queryInterface.addColumn(
          "products",
          "maxWithdrawal",
          {
            type: Sequelize.FLOAT,
            allowNull: true
          },
          {
            transaction: t
          }
        );
        

        return Promise.all(maximumWithdrawalColumn);
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
    const maximumWithdrawalColumn = await queryInterface.removeColumn(
      "products",
      "maxWithdrawal",
      {}
    );
    return Promise.all(maximumWithdrawalColumn);
  }
};
