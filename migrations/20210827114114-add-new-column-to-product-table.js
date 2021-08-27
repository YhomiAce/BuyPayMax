module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
  */
    return queryInterface.sequelize.transaction(async t => {
      try {
        const dollarRateColumn = await queryInterface.addColumn(
          "products",
          "dollarRate",
          {
            type: Sequelize.FLOAT,
            defaultValue:0,
            allowNull: true
          },
          {
            transaction: t
          }
        );
        

        return Promise.all(dollarRateColumn);
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
    const dollarRateColumn = await queryInterface.removeColumn(
      "products",
      "dollarRate",
      {}
    );
    return Promise.all(dollarRateColumn);
  }
};
