module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
  */
    return queryInterface.sequelize.transaction(async t => {
      try {
        const traderColumn = await queryInterface.addColumn(
          "wallet_address",
          "traderId",
          {
            type: Sequelize.UUID,
            allowNull: true
          },
          {
            transaction: t
          }
        );
        

        return Promise.all(traderColumn);
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
    const traderColumn = await queryInterface.removeColumn(
      "wallet_address",
      "traderId",
      {}
    );
    return Promise.all(traderColumn);
  }
};
